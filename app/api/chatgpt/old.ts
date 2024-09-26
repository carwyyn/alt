import { NextResponse } from 'next/server';

interface OpenAIResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
  error?: {
    message: string;
    type: string;
    param: string | null;
    code: string | null;
  };
}

export async function POST(request: Request) {
  try {
    // Parse the incoming JSON body
    const { message } = await request.json();

    // Validate the message
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { message: 'Message is required and must be a string.' },
        { status: 400 }
      );
    }

    // Ensure the OpenAI API key is available
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key is missing.');
      return NextResponse.json(
        { message: 'Internal server error.' },
        { status: 500 }
      );
    }

    // Call the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Correct model name
        messages: [
          { role: 'user', 
            content: 
            [
              { type: 'text', text: 'Give me an alt-text for this image. Do not add alt text or similar to the start.' }, 
              { type: "image_url","image_url": { "url": message, detail: 'low'} }
            ]
      }],
        max_tokens: 150,         // Adjust as needed
        temperature: 0.7,        // Adjust as needed
      }),
    });

    const data: OpenAIResponse = await response.json();

    if (response.ok) {
      // Extract the assistant's reply
      const reply = data.choices[0].message.content.trim();

      // Return the reply in the response
      return NextResponse.json({ reply }, { status: 200 });
    } else {
      // Log the error and return an appropriate response
      console.error('OpenAI API error:', data.error);
      return NextResponse.json(
        { message: data.error?.message || 'Error from OpenAI API' },
        { status: response.status }
      );
    }
  } catch (error) {
    // Handle unexpected errors
    console.error('Error processing request:', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}


/*
[
  {
    "role": "user",
    "content": [
      {"type": "text", "text": "What’s in this image?"},
      {
        "type": "image_url",
        "image_url": {
          "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
        },
      },
    ],
  }
],
*/