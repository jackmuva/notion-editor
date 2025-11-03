import { useState } from 'react';
import { Editor } from "@tiptap/core"
import { BubbleMenu } from "@tiptap/react/menus";
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';

//TODO: validate inputs and keep tokens manageable
export const EditorBubbleMenu = ({
	editor
}: {
	editor: Editor
}) => {
	const [promptText, setPromptText] = useState('');
	const [selectedModel, setSelectedModel] = useState('');

	const sendChat = async () => {
		const fromPos = editor.state.selection.from;
		const toPos = editor.state.selection.to;
		const selectedText = editor.state.doc.textBetween(fromPos, toPos);

		const req = await fetch(`${window.location.origin}/api/chat`, {
			method: "POST",
			body: JSON.stringify({
				text: selectedText,
				prompt: promptText,
				model: selectedModel
			}),
		});

		const res = await req.json();
		const newText = res.newText.steps[0].content[res.newText.steps[0].content.length - 1].text;
		editor.commands.insertContentAt({ from: fromPos, to: toPos }, newText)
	}

	return (
		<BubbleMenu editor={editor}>
			<div className='flex flex-col space-y-0.5 bg-background shadow-lg items-center'>
				<div className='flex flex-col space-y-0.5'>
					<Textarea
						id="prompt-text-area"
						className={"bg-background"}
						placeholder='how should notion editor ai edit the highlighted text?'
						value={promptText}
						onChange={(e) => setPromptText(e.target.value)}
					/>
					<Select disabled={promptText === ""} value={selectedModel} onValueChange={setSelectedModel}>
						<SelectTrigger className="w-full bg-background">
							<SelectValue placeholder="Select a model" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Models</SelectLabel>
								<SelectItem value="google/gemini-2.5-flash">gemini-2.5-flash</SelectItem>
								<SelectItem value="openai/gpt-5-mini">gpt-5-mini</SelectItem>
								<SelectItem value="openai/gpt-4o-mini">gpt-4o-mini</SelectItem>
								<SelectItem value="xai/grok-4-fast-non-reasoning">grok-4</SelectItem>
								<SelectItem value="anthropic/claude-3-haiku">claude-3-haiku</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
				<Button size={'sm'} variant={'default'}
					className='w-full' onClick={sendChat}>
					Send
				</Button>
			</div>
		</BubbleMenu>
	);
}

