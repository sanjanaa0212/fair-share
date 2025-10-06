declare module "*.ttf" {
  const content: string
  export default content
}

// Extend Tailwind's font utilities
declare module "tailwindcss/types/config" {
  interface FontFamily {
    satoshi: string[]
  }
}
