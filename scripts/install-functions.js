const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
    'https://jmfegokyvaflwegtyaun.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmVnb2t5dmFmbHdlZ3R5YXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAyNDIxOSwiZXhwIjoyMDczNjAwMjE5fQ.yPH3ObF9tKB1PzsM2Pj9tsIqBKypCbiDhQ9Mr0stAtM'
);

async function installFunctions() {
    console.log('🔧 INSTALANDO FUNCIONES DE APRENDIZAJE ADAPTATIVO');
    console.log('================================================');

    try {
        // Leer el archivo SQL
        const sql = fs.readFileSync('./database/create-learning-functions-fixed.sql', 'utf8');

        console.log('📄 Archivo SQL leído:', sql.length, 'caracteres');

        // Dividir en statements individuales (separados por puntos y comas)
        const statements = sql
            .split(/;\s*\n/)
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log('📝 Encontrados', statements.length, 'statements SQL');

        // Ejecutar cada statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.length < 10) continue; // Skip very short statements

            console.log(`\n🔧 Ejecutando statement ${i + 1}/${statements.length}...`);
            console.log('📄 Statement:', statement.substring(0, 100) + '...');

            try {
                const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

                if (error) {
                    console.error(`❌ Error en statement ${i + 1}:`, error.message);
                } else {
                    console.log(`✅ Statement ${i + 1} ejecutado correctamente`);
                }
            } catch (e) {
                console.error(`❌ Excepción en statement ${i + 1}:`, e.message);
            }
        }

        console.log('\n================================================');
        console.log('✅ INSTALACIÓN DE FUNCIONES COMPLETADA');

    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

installFunctions();