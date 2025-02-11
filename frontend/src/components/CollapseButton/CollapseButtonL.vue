<template>
    <div class="collapse-button" @click="$emit('update:isCollapse', !isCollapse)">
        <svg stroke-width="2" stroke="currentColor" viewBox="0 10 24 23" fill="none" 
            xmlns="http://www.w3.org/2000/svg" >
            <path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-linejoin="round" stroke-linecap="round"></path>
        </svg>
    </div>
</template>
<script setup>
defineProps({
    isCollapse: {
    type: Boolean,
    required: true,
  },
});

</script>
<style scoped>
.collapse-button {
    width: 2em;
    height: auto;
    overflow: hidden;
    border: none;
    color: black;
    background: none;
    position: relative;
    cursor: pointer;
}

.collapse-button>div,
.collapse-button>svg {
    position: absolute;
    width: 1.5em;
    height: 100%;
    display: flex;
}

.collapse-button:before {
    content: "";
    position: absolute;
    height: 2px;
    bottom: 0;
    left: 0;
    width: 100%;
    transform: scaleX(0);
    transform-origin: bottom right;
    background: currentColor;
    transition: transform 0.25s ease-out;
}

.collapse-button:hover:before {
    transform: scaleX(1);
    transform-origin: bottom left;
}

.collapse-button .clone>*,
.collapse-button .text>* {
    opacity: 1;
    font-size: 1.3rem;
    transition: 0.2s;
    margin-left: 4px;
}

.collapse-button .clone>* {
    transform: translateY(60px);
}

.collapse-button:hover .clone>* {
    opacity: 1;
    transform: translateY(0px);
    transition: all 0.2s cubic-bezier(0.215, 0.61, 0.355, 1) 0s;
}

.collapse-button:hover .text>* {
    opacity: 1;
    transform: translateY(-60px);
    transition: all 0.2s cubic-bezier(0.215, 0.61, 0.355, 1) 0s;
}

.collapse-button:hover .clone> :nth-child(1) {
    transition-delay: 0.15s;
}

.collapse-button:hover .clone> :nth-child(2) {
    transition-delay: 0.2s;
}

.collapse-button:hover .clone> :nth-child(3) {
    transition-delay: 0.25s;
}

.collapse-button:hover .clone> :nth-child(4) {
    transition-delay: 0.3s;
}

/* icon style and hover*/
.collapse-button svg {
    width: 1.5em;
    right: 0;
    top: 50%;
    transform: translateY(-40%) rotate(-135deg);
    transition: 0.2s ease-out;
}

.collapse-button:hover svg {
    transform: translateY(-40%) rotate(-180deg);
}
</style>