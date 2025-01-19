import { z } from 'zod'
import { Agent } from '@openserv-labs/sdk'
import fetch from 'node-fetch'
import fs from 'fs'
import 'dotenv/config'

// Create the image generation agent
const agent = new Agent({
  systemPrompt: 'You are an AI image generation agent that creates images using the FLUX.1-schnell model. You help users generate beautiful, detailed images based on their descriptions.'
})

// Add image generation capability
agent.addCapability({
  name: 'generateImage',
  description: 'Generates an image based on a text prompt using FLUX.1-schnell model',
  schema: z.object({
    prompt: z.string().describe('Detailed description of the image to generate'),
    filename: z.string().optional().default('generated_image.png')
  }),
  async run({ args }) {
    try {
      // Query the Hugging Face API
      const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: args.prompt
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${await response.text()}`)
      }

      // Get the image data
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const imageBuffer = Buffer.from(arrayBuffer)

      // Save the image locally
      fs.writeFileSync(args.filename, imageBuffer)

      return `Image generated and saved locally as ${args.filename}`

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Error generating image: ${errorMessage}`)
    }
  }
})

// Add example usage capability
agent.addCapability({
  name: 'help',
  description: 'Shows example prompts and usage instructions',
  schema: z.object({}),
  async run() {
    return `
Example prompts:
1. "A majestic ancient library at dusk, illuminated by warm golden chandeliers..."
2. "A futuristic cityscape with flying cars and neon lights..."
3. "A serene mountain landscape with a crystal clear lake..."

Usage:
- Provide detailed descriptions including style, lighting, and atmosphere
- Be specific about important elements you want in the image
- You can specify artistic styles like "hyperrealistic", "cinematic", "octane render"
`
  }
})

// Start the agent server
// agent.start()

// Example usage
async function main() {
  const result = await agent.process({
    messages: [
      {
        role: 'user',
        content: 'A magical forest at night, with a full moon and stars'
      }
    ]
  })

  console.log('Result:', result.choices[0].message.content)
}

main();
