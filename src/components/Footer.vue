<template>
  <footer :class="cn(' border-t ', className)">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="col-span-1 md:col-span-2">
          <slot name="brand">
            <Logo class="mb-4" />
            <Text class="ui-text max-w-md">
              Building beautiful applications with modern Vue.js components.
            </Text>
          </slot>
        </div>

        <!-- Links -->
        <div>
          <slot name="links">
            <Typography
              variant="text-sm"
              class="mb-4"
            >
              Quick Links
            </Typography>
            <div class="space-y-2">
              <Link
                href="#"
                class="block ui-text hover:text-(--ui-text)"
              >
                About
              </Link>
              <Link
                href="#"
                class="block ui-text hover:text-(--ui-text)"
              >
                Services
              </Link>
              <Link
                href="#"
                class="block ui-text hover:text-(--ui-text)"
              >
                Contact
              </Link>
            </div>
          </slot>
        </div>

        <!-- Social -->
        <div>
          <slot name="social">
            <Typography
              variant="text-sm"
              class="mb-4"
            >
              Follow Us
            </Typography>
            <div class="flex space-x-4">
              <Link
                href="#"
                class="ui-text hover:text-(--ui-text)"
              >
                <Icon
                  name="square-x-twitter"
                  prefix="fab"
                  class="h-5 w-5"
                />
              </Link>
              <Link
                href="#"
                class="ui-text hover:text-(--ui-text)"
              >
                <Icon
                  name="github"
                  prefix="fab"
                  class="h-5 w-5"
                />
              </Link>
            </div>
          </slot>
        </div>
      </div>

      <Divider class="my-8" />

      <div class="flex flex-col md:flex-row justify-between items-center">
        <slot name="copyright">
          <Text class="ui-text">
            © {{ new Date().getFullYear() }} Your Company. All rights reserved.
          </Text>
        </slot>
        <slot name="legal">
          <div class="flex space-x-6 mt-4 md:mt-0">
            <Link
              href="#"
              class="ui-text hover:text-(--ui-text)"
            >
              Privacy
            </Link>
            <Link
              href="#"
              class="ui-text hover:text-(--ui-text)"
            >
              Terms
            </Link>
          </div>
        </slot>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { cn } from '../utils/cn.js'
import Divider from './Divider.vue'
import Icon from './Icon.vue'
import Link from './Link.vue'
import Logo from './Logo.vue'
import Text from './Text.vue'
import Typography from './Typography.vue'

defineProps({
  className: {
    type: String,
    default: ''
  }
})
</script>
