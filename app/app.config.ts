export default defineAppConfig({
  // https://ui.nuxt.com/getting-started/theme#design-system
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'slate',
    },
    button: {
      defaultVariants: {
        // Set default button color to neutral
        // color: 'neutral'
      },
    },
    card: {
      slots: {
        root: 'rounded-lg',
        header: 'p-4 sm:px-6 border-b-0',
        body: 'p-4 pt-2 sm:p-6 sm:pt-2',
        footer: 'p-4 sm:px-6',
      },
      variants: {
        variant: {
          outline: {
            root: 'ring-0',
          },
        },
      },
    },
    table: {
      slots: {
        th: 'whitespace-nowrap text-center',
        td: 'text-center',
      },
    },
  },
})
