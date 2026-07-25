<template>
    <ThemeProvider :theme="theme">
        <CssBaseline />
        <AppBar position="sticky" style="height:64px;">
            <Toolbar>
                <Typography variant="h6" component="div" :sx="{ flexGrow: 1 }">
                言语 FLIP
                </Typography>
            </Toolbar>
        </AppBar>
        <RouterView />
    </ThemeProvider>
</template>

<style scoped></style>

<script setup lang="ts">
import { AppBar as AppBarReact, type AppBarProps, Toolbar as ToolbarReact, Typography as TypographyReact, type TypographyProps, ThemeProvider as ThemeProviderReact, createTheme, CssBaseline as CssBaselineReact } from "@mui/material"
import { applyReactInVue, applyPureReactInVue } from "veaury";

const theme = createTheme({
    palette: {
        mode: window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light"
    }
})

const AppBar = applyPureReactInVue(AppBarReact);
const Toolbar = applyPureReactInVue(ToolbarReact);
const Typography = applyPureReactInVue(TypographyReact);
const ThemeProvider = applyPureReactInVue(ThemeProviderReact);
const CssBaseline = applyPureReactInVue(CssBaselineReact);

setInterval(() => {
    document.querySelectorAll("[data-use-vue-component-wrap]").forEach((el) => el.setAttribute("style", el.getAttribute("style").replace("all: unset;", "")));
    document.querySelectorAll("[__use_react_component_wrap]").forEach((el) => el.setAttribute("style", el.getAttribute("style").replace("all: unset;", "")));
}, 10);
</script>