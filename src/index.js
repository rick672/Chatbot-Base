const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require("baileys")
const QRCode = require('qrcode')
const ffmpeg = require('fluent-ffmpeg')


async function conectarConWhatsapp(){

    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

    const sock = makeWASocket({
        auth: state,
    })

    sock.ev.on("creds.update", saveCreds)

    // conexion
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (connection === "close"){
            const puedeConectar = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (puedeConectar){
                conectarConWhatsapp()
            }
        } else if (connection === "open"){
            console.log("Conectado !!!!")
        }

        if (qr){
            console.log(await QRCode.toString(qr, { type: "terminal", small: true }))
        }
    })

    // recibir mensajes
    sock.ev.on("messages.upsert", async (event) => {
        for (const message of event.messages) {
            console.log(message);
            const id = message.key.remoteJid;

            if(event.type != 'notify' || message.key.fromMe || id.includes('@g.us') || id.includes('@broadcast'))
            {
                return;
            }

            await delay(1000);
            // leer mensaje dejar como leido
            await sock.readMessages([message.key]);

            // animacion (escribiendo...)
            await sock.sendPresenceUpdate("composing", id)
            await delay(3000);
            await sock.sendPresenceUpdate("recording", id)
            await delay(3000);

            // Responder aun mensaje en espefico
            await sock.sendMessage(id, { text: 'Hola, que necesitas'}, { quoted: message});
            // enviar mensaje
            await sock.sendMessage(id, { text: 'Hola, soy un bot :)' });
            // mencionar
            await sock.sendMessage(
                id, 
                { 
                    text: 'HOLA, @59165181877',
                    mentions: [ '59165181877@s.whatsapp.net' ]
                }
            );
            // enviar ubicacion
            await sock.sendMessage(
                id, 
                { 
                    location: {
                        degreesLatitude: 40.416775,
                        degreesLongitude: -3.703790,
                        name: 'Barcelona',
                        address: 'Carrer de Balmes, 1',
                        isLive: true
                    }
                }
            );
            // enviar contacto
            const vcard = 'BEGIN:VCARD\n' +
                'VERSION:3.0\n' +
                'FN:Ricardo\n' +
                'N:Doe;John;;;\n' +
                'TEL;type=CELL;type=VOICE;waid=59165181877:+59165181877\n' +
                'END:VCARD';
            await sock.sendMessage(
                id, 
                { 
                    contacts: {
                        displayName: 'Ricardo',
                        contacts: [{ vcard }]
                    }
                }
            );
            // reacciones
            await sock.sendMessage(
                id, 
                { 
                    react: 
                    { 
                        text: '🎱', key: message.key 
                    } 
                }
            );
            // encuesta
            await sock.sendMessage(
                id, 
                { 
                    poll: {
                        name: 'Que tecnologia te gusta más?',
                        values: ['React', 'Vue', 'Angular'],
                        selectableCount: 1,
                        toAnnouncementGroup: false
                    }
                }
            );
            // enlaces con vista previa
            await sock.sendMessage(
                id, 
                { 
                    text: 'Visita mi sitio web https://www.google.com'
                }
            );
            // enviar imagen
            await sock.sendMessage(
                id, 
                { 
                    image: {
                        url: 'https://www.mcgregorfast.com/static/101a03068180eee94704766ecab0dfe6/0f617/conor-bio.webp'
                    }
                }
            );
            // enviar imagen con descripcion
            await sock.sendMessage(
                id, 
                { 
                    image: {
                        url: 'https://www.mcgregorfast.com/static/101a03068180eee94704766ecab0dfe6/0f617/conor-bio.webp'
                    },
                    caption: 'Conor McGregor *El mejor*'
                }
            );
            // imagen desde local
            await sock.sendMessage(
                id, 
                { 
                    image: {
                        url: './Media/foto316.jpg'
                    },
                    caption: 'Perfil de Conor McGregor *El mejor*'
                }
            );

            // enviar archivo
            await sock.sendMessage(
                id,
                {
                    document: {
                        url: "./Media/CV RICARDO ALIAGA.pdf"
                    },
                    fileName: "Conoceme",
                    caption: "CV RICARDO ALIAGA"
                }
            );
            // enviar video
            // await sock.sendMessage(
            //     id,
            //     {
            //         video: {
            //             url: "#"
            //         },
            //         caption: "En este video puedes ver como funciona mi bot",
            //         ptv: true // false
            //     }
            // );
            // enviar gif
            await sock.sendMessage(
                id,
                {
                    video: {
                        url: "https://media.giphy.com/media/l0MYd5o7v9t3m/giphy.gif"
                    },
                    gifPlayback: true
                }
            );

            // Para el audio
            // const mp3Path = "./Media/mi-audio.mp3"
            // const opusPath = mp3Path.replace(/\.mp3$/, ".opus")
            // await convertMp3ToOpus(mp3Path, opusPath)
            // // enviar audio
            // await sock.sendMessage(
            //     id,
            //     {
            //         audio: {
            //             url: "./Media/mi-audio.opus"
            //         },
            //         ptt: true
            //     }
            // );


        }
    })

}

conectarConWhatsapp()

// para cambiar el formato de mp3 a .opus
// function convertMp3ToOpus(inputPath, outputPath) {
//     return new Promise((resolve, reject) => {
//         ffmpeg(inputPath)
//             .audioCodec('libopus')
//             .format("opus")
//             .audioBitrate(64)
//             .on('end', ()  => resolve(outputPath))
//             .on('error', reject)
//             .save(outputPath);
//     });
// }