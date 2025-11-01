#!/bin/bash

echo "🛡️  CONFIGURACIÓN DE LÍMITES DE API - PROTECCIÓN DE COSTOS"
echo "========================================================="
echo ""

echo -e "\033[1;33m⚠️  IMPORTANTE: Configura estos límites AHORA para proteger tu presupuesto\033[0m"
echo ""

echo "🔐 OPENAI (GPT Models)"
echo "Dashboard: https://platform.openai.com/usage"
echo "➤ 1. Ve a Settings > Limits"
echo "➤ 2. Establece Monthly budget: \$10 USD"
echo "➤ 3. Activa 'Hard limit' (bloquea automáticamente)"
echo "➤ 4. Habilita email alerts al 75% y 90%"
echo "   API Key: sk-proj-..."
echo ""

echo "🤖 ANTHROPIC (Claude Models)"
echo "Dashboard: https://console.anthropic.com/settings/usage"
echo "➤ 1. Ve a Usage & Billing"
echo "➤ 2. Establece Usage cap: \$5 USD/mes"
echo "➤ 3. Activa email notifications"
echo "   API Key: sk-ant-a..."
echo ""

echo "🧠 GOOGLE GEMINI"
echo "Dashboard: https://aistudio.google.com/app/apikey"
echo "Dashboard Billing: https://console.cloud.google.com/billing"
echo "➤ 1. Ve a Quotas & System Limits"
echo "➤ 2. Establece daily request limits"
echo "➤ 3. Configura budget alerts en Google Cloud"
echo "   API Key: AIzaSyCq..."
echo ""

echo "🚀 GROK (xAI)"
echo "Dashboard: https://console.x.ai/"
echo "➤ 1. Ve a Billing & Usage"
echo "➤ 2. Establece spending limit: \$5 USD/mes"
echo "➤ 3. Activa usage alerts"
echo "   API Key: xai-h0dk..."
echo ""

echo -e "\033[1;32m💡 ESTRATEGIA RECOMENDADA:\033[0m"
echo "• Límite total sugerido: \$20/mes máximo"
echo "• OpenAI: \$10/mes (modelo más usado)"
echo "• Anthropic: \$5/mes"
echo "• Grok: \$5/mes"
echo "• Gemini: Solo límites gratuitos"
echo ""

echo -e "\033[1;31m🚨 ACCIÓN INMEDIATA REQUERIDA:\033[0m"
echo "1. Abre cada dashboard AHORA"
echo "2. Configura los límites antes de desplegar"
echo "3. Verifica que los emails de alerta funcionen"
echo "4. Considera crear API keys separadas solo para demo"
echo ""

echo -e "\033[1;36m📊 MONITOREO CONTINUO:\033[0m"
echo "• Revisa usage diariamente los primeros días"
echo "• Configura alertas en tu email/teléfono"
echo "• Usa modelos más baratos para demo (GPT-3.5 vs GPT-4)"
echo ""

read -p "¿Quieres que abra los dashboards automáticamente? (y/n): " open_dashboards

if [[ $open_dashboards == "y" || $open_dashboards == "Y" ]]; then
    echo "Abriendo dashboards..."
    
    # Detectar el comando para abrir URLs según el sistema
    if command -v xdg-open > /dev/null; then
        OPEN_CMD="xdg-open"
    elif command -v open > /dev/null; then
        OPEN_CMD="open"
    else
        echo "No se puede abrir automáticamente. Copia las URLs manualmente."
        exit 1
    fi
    
    echo "Abriendo OpenAI Dashboard..."
    $OPEN_CMD "https://platform.openai.com/usage" 2>/dev/null &
    sleep 2
    
    echo "Abriendo Anthropic Dashboard..."
    $OPEN_CMD "https://console.anthropic.com/settings/usage" 2>/dev/null &
    sleep 2
    
    echo "Abriendo Google AI Studio..."
    $OPEN_CMD "https://aistudio.google.com/app/apikey" 2>/dev/null &
    sleep 2
    
    echo "Abriendo xAI Console..."
    $OPEN_CMD "https://console.x.ai/" 2>/dev/null &
    
    echo "✅ Dashboards abiertos. Configura los límites en cada uno."
fi

echo ""
echo -e "\033[1;33m⏰ RECORDATORIO: No despliegues hasta configurar estos límites\033[0m"