<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>GesPis — Gestión de Piscina</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/App.jsx'])
</head>
<body>
    <div id="root"></div>
</body>
</html>
