import { defineConfig } from 'vite';
export default defineConfig({root:'src',publicDir:'../public',base:'./',build:{outDir:'../dist/client',emptyOutDir:true,target:'es2020',chunkSizeWarningLimit:700},server:{host:'0.0.0.0',allowedHosts:['terminal.local'],port:4173,strictPort:true}});
