import { generateText, ModelMessage } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

//TODO: verify token
export async function POST(req: Request) {
	const { prompt, text, model }: { prompt: string, text: string, model: string } = await req.json();

	const messages: ModelMessage[] = [];
	messages.push({
		role: "system",
		content: `you are an ai editor, editing notion docs. The user will give you the original text and a prompt. 
Edit the original text. No need for an explanation.`,
	});

	messages.push({
		role: "user",
		content: `Revise this text: "${text}"
${prompt}`,
	});

	const result = await generateText({
		model: model,
		messages: messages,
	});

	return NextResponse.json({ newText: result });;
}
