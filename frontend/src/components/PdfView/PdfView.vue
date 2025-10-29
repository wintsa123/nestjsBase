<template>
  <div class="pdf-viewer">
    <div class="controls">
      <span>共 {{ totalPages }} 页</span>
      <input v-model.number="scale" type="number" step="0.1" min="0.5" max="3" />
      <label>
        <input type="checkbox" v-model="showOutline" />
        显示目录
      </label>
    </div>

    <div class="viewer-container">
      <!-- 目录侧边栏 -->
      <div v-if="showOutline" class="outline-sidebar">
        <h3>目录</h3>
        <div v-if="outline.length === 0 && textBasedHeadings.length === 0" class="no-outline">
          未检测到目录结构
        </div>
        
        <!-- 标准目录 -->
        <div v-if="outline.length > 0" class="outline-list">
          <div
            v-for="(item, index) in outline"
            :key="index"
            :style="{ paddingLeft: (item.level * 15) + 'px' }"
            class="outline-item"
            @click="scrollToPage(item.pageIndex)"
          >
            <span class="item-title">{{ item.title }}</span>
            <span v-if="item.pageIndex" class="item-page">{{ item.pageIndex }}</span>
          </div>
        </div>

        <!-- 显示提取的文本标题 -->
        <div v-if="textBasedHeadings.length > 0" class="text-headings">
          <h4>{{ outline.length > 0 ? '其他标题:' : '检测到的标题:' }}</h4>
          <div
            v-for="(heading, index) in textBasedHeadings"
            :key="'heading-' + index"
            :style="{ paddingLeft: (heading.level * 15) + 'px' }"
            class="outline-item"
            @click="scrollToPage(heading.pageIndex)"
          >
            <span class="item-title">{{ heading.text }}</span>
            <span class="item-page">{{ heading.pageIndex }}</span>
          </div>
        </div>
      </div>

      <!-- PDF 页面容器 -->
      <div class="pages-container" ref="pagesContainer">
        <div
          v-for="pageNum in totalPages"
          :key="pageNum"
          :ref="el => setPageRef(el, pageNum)"
          class="page-wrapper"
          :data-page="pageNum"
        >
          <div class="page-number">第 {{ pageNum }} 页</div>
          <canvas :ref="el => setCanvasRef(el, pageNum)"></canvas>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-text">加载中... {{ loadingProgress }}%</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'

// 设置 worker
import PdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'

const props = defineProps({
  pdfUrl: {
    type: String,
    required: true
  }
})

const pagesContainer = ref(null)
const canvasRefs = ref({})
const pageRefs = ref({})
const totalPages = ref(0)
const scale = ref(1.5)
const loading = ref(false)
const loadingProgress = ref(0)
const outline = ref([])
const textBasedHeadings = ref([])
const showOutline = ref(true)
let pdfDoc = null

const setCanvasRef = (el, pageNum) => {
  if (el) {
    canvasRefs.value[pageNum] = el
  }
}

const setPageRef = (el, pageNum) => {
  if (el) {
    pageRefs.value[pageNum] = el
  }
}

// 从 Annotations（链接注释）中提取目录
const extractTOCFromAnnotations = async () => {
  const tocItems = []
  const linksByPage = {}

  console.log('开始扫描页面注释...')

  // 扫描前10页或所有页面的注释（目录通常在前面）
  const pagesToScan = Math.min(10, totalPages.value)
  
  for (let pageNum = 1; pageNum <= pagesToScan; pageNum++) {
    try {
      const page = await pdfDoc.getPage(pageNum)
      const annotations = await page.getAnnotations()

      if (annotations && annotations.length > 0) {
        console.log(`第 ${pageNum} 页找到 ${annotations.length} 个注释`)

        for (const annotation of annotations) {
          console.log(`注释类型: ${annotation.subtype}`, annotation)

          // 查找 Link 类型的注释
          if (annotation.subtype === 'Link') {
            let targetPage = null
            let linkText = annotation.contents || ''

            // 解析目标页面
            if (annotation.dest) {
              // 内部链接
              try {
                let dest = annotation.dest
                if (typeof dest === 'string') {
                  dest = await pdfDoc.getDestination(dest)
                }
                if (dest && dest[0]) {
                  targetPage = await pdfDoc.getPageIndex(dest[0]) + 1
                }
              } catch (e) {
                console.log('解析链接目标失败:', e)
              }
            }

            // 获取链接区域的文本
            if (annotation.rect) {
              const textContent = await page.getTextContent()
              const rect = annotation.rect
              let foundText = ''
              
              // 查找在链接区域内的文本
              for (const item of textContent.items) {
                if (item.transform) {
                  const x = item.transform[4]
                  const y = item.transform[5]
                  
                  // 检查文本是否在链接矩形区域内
                  if (x >= rect[0] - 2 && x <= rect[2] + 2 && 
                      y >= rect[1] - 2 && y <= rect[3] + 2) {
                    foundText += item.str
                  }
                }
              }
              
              if (foundText.trim()) {
                linkText = foundText.trim()
              }
            }

            if (targetPage && linkText) {
              if (!linksByPage[pageNum]) {
                linksByPage[pageNum] = []
              }
              linksByPage[pageNum].push({
                text: linkText,
                targetPage: targetPage,
                sourceRect: annotation.rect,
                annotation: annotation
              })
              console.log(`找到链接: "${linkText}" -> 第 ${targetPage} 页`)
            }
          }
        }
      }
    } catch (error) {
      console.error(`提取第 ${pageNum} 页注释失败:`, error)
    }
  }

  console.log('所有页面的链接汇总:', linksByPage)

  // 查找目录页（通常在前几页，且包含大量链接）
  let tocPageNum = null
  let maxLinks = 0

  for (const [pageNum, links] of Object.entries(linksByPage)) {
    const linksCount = links.length
    if (linksCount > maxLinks && linksCount > 2) {
      maxLinks = linksCount
      tocPageNum = parseInt(pageNum)
    }
  }

  if (tocPageNum && linksByPage[tocPageNum]) {
    console.log(`✅ 检测到目录页: 第 ${tocPageNum} 页，共 ${maxLinks} 个链接`)

    // 按垂直位置排序链接（从上到下）
    const sortedLinks = linksByPage[tocPageNum].sort((a, b) => {
      return b.sourceRect[3] - a.sourceRect[3] // Y坐标降序
    })

    // 将链接转换为目录项
    for (const link of sortedLinks) {
      // 尝试检测标题级别（基于缩进）
      let level = 0
      const indent = link.sourceRect[0]
      if (indent > 100) level = 2
      else if (indent > 60) level = 1

      tocItems.push({
        title: link.text,
        pageIndex: link.targetPage,
        level: level
      })
    }
  } else {
    console.log('❌ 未找到目录页（没有页面包含足够的链接）')
  }

  return tocItems
}

// 递归解析 outline
const parseOutline = async (items, level = 0) => {
  const result = []

  for (const item of items) {
    try {
      let pageIndex = null

      // 解析目标页面
      if (item.dest) {
        if (typeof item.dest === 'string') {
          const dest = await pdfDoc.getDestination(item.dest)
          if (dest && dest[0]) {
            pageIndex = await pdfDoc.getPageIndex(dest[0])
          }
        } else if (Array.isArray(item.dest) && item.dest[0]) {
          pageIndex = await pdfDoc.getPageIndex(item.dest[0])
        }
      }

      result.push({
        title: item.title,
        level: level,
        pageIndex: pageIndex !== null ? pageIndex + 1 : null
      })

      // 递归处理子项
      if (item.items && item.items.length > 0) {
        const children = await parseOutline(item.items, level + 1)
        result.push(...children)
      }
    } catch (error) {
      console.error('解析目录项失败:', item, error)
    }
  }

  return result
}

// 提取目录的多种方法
const extractOutline = async () => {
  if (!pdfDoc) return

  try {
    console.log('========== 开始提取目录 ==========')
    
    // 方法1: 使用 getOutline
    const pdfOutline = await pdfDoc.getOutline()
    console.log('1. PDF Outline:', pdfOutline)

    if (pdfOutline && pdfOutline.length > 0) {
      outline.value = await parseOutline(pdfOutline)
      console.log('✅ 从 Outline 提取到目录:', outline.value)
      return
    }

    // 方法2: 尝试获取 destinations
    try {
      const destinations = await pdfDoc.getDestinations()
      console.log('2. PDF Destinations:', destinations)
    } catch (e) {
      console.log('无法获取 destinations:', e)
    }

    // 方法3: 从 Annotations（链接注释）中提取目录
    console.log('3. 尝试从注释/链接中提取目录...')
    const tocFromAnnotations = await extractTOCFromAnnotations()
    if (tocFromAnnotations.length > 0) {
      outline.value = tocFromAnnotations
      console.log('✅ 从注释中提取到目录:', outline.value)
      return
    }

    // 方法4: 尝试从文本内容中提取标题
    console.log('4. 尝试从文本内容中提取标题...')
    textBasedHeadings.value = await extractHeadingsFromText()
    if (textBasedHeadings.value.length > 0) {
      console.log('✅ 提取到文本标题:', textBasedHeadings.value)
    } else {
      console.log('❌ 未能提取到任何目录信息')
    }

  } catch (error) {
    console.error('提取目录失败:', error)
  }
}

// 从文本内容中提取标题（基于字体大小和样式）
const extractHeadingsFromText = async () => {
  const headings = []

  for (let pageNum = 1; pageNum <= Math.min(totalPages.value, 10); pageNum++) {
    try {
      const page = await pdfDoc.getPage(pageNum)
      const textContent = await page.getTextContent()

      // 分析文本样式，找出可能的标题
      const textItems = textContent.items
      const fontSizes = textItems.map(item => item.height || 0)
      const avgFontSize = fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length

      let currentLine = ''
      let currentFontSize = 0

      for (const item of textItems) {
        const fontSize = item.height || 0
        const text = item.str.trim()

        // 如果字体明显大于平均值
        if (fontSize > avgFontSize * 1.2 && text) {
          if (Math.abs(fontSize - currentFontSize) < 0.5) {
            currentLine += text
          } else {
            if (currentLine && currentLine.length > 0 && currentLine.length < 100) {
              // 判断标题级别
              let level = 0
              if (currentFontSize > avgFontSize * 1.8) level = 0
              else if (currentFontSize > avgFontSize * 1.5) level = 1
              else if (currentFontSize > avgFontSize * 1.2) level = 2

              headings.push({
                text: currentLine,
                pageIndex: pageNum,
                level: level,
                fontSize: currentFontSize
              })
            }
            currentLine = text
            currentFontSize = fontSize
          }
        }
      }

      // 处理最后一行
      if (currentLine && currentLine.length > 0 && currentLine.length < 100) {
        let level = 0
        if (currentFontSize > avgFontSize * 1.8) level = 0
        else if (currentFontSize > avgFontSize * 1.5) level = 1
        else if (currentFontSize > avgFontSize * 1.2) level = 2

        headings.push({
          text: currentLine,
          pageIndex: pageNum,
          level: level,
          fontSize: currentFontSize
        })
      }
    } catch (error) {
      console.error(`提取第 ${pageNum} 页文本失败:`, error)
    }
  }

  // 去重相似的标题
  return headings.filter((heading, index, self) => 
    index === self.findIndex(h => h.text === heading.text && h.pageIndex === heading.pageIndex)
  )
}

// 滚动到指定页面
const scrollToPage = (pageIndex) => {
  if (pageIndex && pageRefs.value[pageIndex]) {
    pageRefs.value[pageIndex].scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
  }
}

// 加载 PDF
const loadPDF = async () => {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker

    loading.value = true
    loadingProgress.value = 0

    const loadingTask = pdfjsLib.getDocument(props.pdfUrl)
    
    loadingTask.onProgress = (progress) => {
      if (progress.total > 0) {
        loadingProgress.value = Math.round((progress.loaded / progress.total) * 100)
      }
    }

    pdfDoc = await loadingTask.promise
    totalPages.value = pdfDoc.numPages

    const metadata = await pdfDoc.getMetadata()
    console.log('PDF 加载完成:', {
      总页数: pdfDoc.numPages,
      元数据: metadata
    })

    // 提取目录
    await extractOutline()

    // 等待 DOM 更新
    await nextTick()

    // 渲染所有页面
    await renderAllPages()

  } catch (error) {
    console.error('加载 PDF 失败:', error)
  } finally {
    loading.value = false
  }
}

// 渲染所有页面
const renderAllPages = async () => {
  for (let pageNum = 1; pageNum <= totalPages.value; pageNum++) {
    await renderPage(pageNum)
    loadingProgress.value = Math.round((pageNum / totalPages.value) * 100)
  }
}

// 渲染单个页面
const renderPage = async (pageNum) => {
  if (!pdfDoc) return

  try {
    const page = await pdfDoc.getPage(pageNum)
    const viewport = page.getViewport({ scale: scale.value })

    const canvas = canvasRefs.value[pageNum]
    if (!canvas) return

    const context = canvas.getContext('2d')

    canvas.height = viewport.height
    canvas.width = viewport.width

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    }

    await page.render(renderContext).promise
  } catch (error) {
    console.error(`渲染第 ${pageNum} 页失败:`, error)
  }
}

// 监听缩放变化
watch(scale, async () => {
  if (pdfDoc) {
    loading.value = true
    await renderAllPages()
    loading.value = false
  }
})

// 监听 PDF URL 变化
watch(() => props.pdfUrl, () => {
  canvasRefs.value = {}
  pageRefs.value = {}
  outline.value = []
  textBasedHeadings.value = []
  loadPDF()
})

onMounted(() => {
  loadPDF()
})
</script>

<style scoped>
.pdf-viewer {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.controls {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
}

.controls input[type="number"] {
  width: 80px;
  padding: 5px;
}

.viewer-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.outline-sidebar {
  width: 300px;
  background: #fafafa;
  border-right: 1px solid #ddd;
  overflow-y: auto;
  padding: 15px;
  flex-shrink: 0;
}

.outline-sidebar h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #333;
}

.outline-sidebar h4 {
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
  border-top: 1px solid #ddd;
  padding-top: 15px;
}

.no-outline {
  color: #999;
  font-size: 14px;
}

.outline-list,
.text-headings {
  font-size: 14px;
}

.outline-item {
  padding: 8px 10px;
  margin: 2px 0;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
  line-height: 1.4;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.outline-item:hover {
  background: #e8e8e8;
}

.item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-page {
  color: #999;
  font-size: 12px;
  margin-left: 10px;
  flex-shrink: 0;
}

.pages-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  padding: 20px;
  background: #e8e8e8;
}

.page-wrapper {
  margin-bottom: 20px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 10px;
  border-radius: 4px;
}

.page-number {
  text-align: center;
  padding: 8px;
  color: #666;
  font-size: 14px;
  background: #f9f9f9;
  margin-bottom: 10px;
  border-radius: 3px;
}

canvas {
  display: block;
  margin: 0 auto;
  max-width: 100%;
}

.loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-text {
  font-size: 18px;
  color: #666;
}
</style>