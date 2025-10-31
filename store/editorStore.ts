import { create } from 'zustand'

export type EditorState = {
	selectedPageId: string,
	setSelectedPageId: (id: string) => void,
}

export const useEditorStore = create<EditorState>((set) => ({
	selectedPageId: "",

	setSelectedPageId: (id: string) => {
		set({ selectedPageId: id });
	},
}))

