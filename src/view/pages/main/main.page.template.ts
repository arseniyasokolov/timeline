export function getMainPageTemplate(state: any): string {
    return `
        <header class="layout__header"></header>
        <main class="layout__router-outlet" router-outlet></main>
        <footer class="footer layout__footer"></footer>
    `;
}