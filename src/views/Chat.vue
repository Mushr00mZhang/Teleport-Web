<template>
  <section class="teleport-chat">
    <header class="teleport-chat-header"></header>
    <main class="teleport-chat-main"></main>
    <footer class="teleport-chat-footer"></footer>
  </section>
</template>
<script setup lang="ts"></script>
<style lang="scss">
$prefix-class: 'teleport-chat';
.#{$prefix-class} {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  &-header {
    flex: none;
  }
  &-main {
    flex: 1;
    overflow: hidden;
  }
  &-footer {
    flex: none;
  }
}
</style>
