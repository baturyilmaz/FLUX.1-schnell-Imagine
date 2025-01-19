import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function query(prompt: string) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
        {
            headers: {
                Authorization: `Bearer ${process.env.HF_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                inputs: prompt
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.blob();
    return result;
}

async function main() {
    try {
        const imageBlob = await query(`A majestic ancient library at dusk, illuminated by warm golden chandeliers, 
            with towering wooden bookshelves reaching up to vaulted ceilings. Ornate spiral staircases wind between 
            the shelves, while dust motes dance in beams of light filtering through stained glass windows. 
            Ancient leather-bound tomes line the shelves, and floating magical manuscripts emit a soft blue glow. 
            A massive astronomic clock mechanism adorns one wall, with intricate brass gears and celestial markers. 
            Hyperrealistic, cinematic lighting, octane render, 8k resolution, highly detailed.`);
        
        // Convert blob to buffer and save
        const arrayBuffer = await imageBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        fs.writeFileSync('generated_image.png', buffer);
        console.log('Image saved successfully!');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

main();