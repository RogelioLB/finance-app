import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define las rutas que quieres proteger
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    // Si la ruta es protegida, forzamos la protección
    if (isProtectedRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Excluye archivos estáticos y de Next.js
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Siempre ejecuta para rutas API
        '/(api|trpc)(.*)',
    ],
};