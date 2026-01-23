<template>
    <div>
        <div class="loader-container">
            <div class="loader-bar"></div>
        </div>
    </div>
</template>

<style>

   * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
           
            min-height: 100vh;
        }

        /* Conteneur du loader */
        .loader-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: transparent;
            z-index: 9999;
            overflow: hidden;
        }

        /* Barre de progression avec animation */
        .loader-bar {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 30%;
            background: linear-gradient(90deg, #1f6feb, #58a6ff, #1f6feb);
            background-size: 200% 100%;
            animation: loading 2s infinite;
        }

        /* Animation de chargement */
        @keyframes loading {
            0% {
                left: -30%;
                background-position: 200% 0;
            }
            50% {
                background-position: 0% 0;
            }
            100% {
                left: 100%;
                background-position: -200% 0;
            }
        }
</style>