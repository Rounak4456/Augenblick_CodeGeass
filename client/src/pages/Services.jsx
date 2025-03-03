import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Color from '@tiptap/extension-color'
import { useState, useEffect } from 'react'
import { db } from '../firebase/FirebaseConfig'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { useAuth } from '../firebase/AuthContext'
import { motion } from 'framer-motion'
import CharacterCount from '@tiptap/extension-character-count'

export default function Services() {
    const [wordCount, setWordCount] = useState(0)
    const [status] = useState('connected')
    const { user } = useAuth()
    const [docId] = useState(`doc_${Date.now()}`)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            TextStyle,
            FontFamily,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Underline,
            Highlight,
            Color,
            CharacterCount,
        ],
        content: '<p>Start writing your document...</p>',
        onUpdate: ({ editor }) => {
            if (user) {
                const content = editor.getHTML()
                saveToFirestore(content)
                setWordCount(editor.storage.characterCount.words())
            }
        },
        editorProps: {
            attributes: {
                class: 'prose max-w-none focus:outline-none px-8 py-6',
                style: 'min-height: 500px;'
            }
        }
    })

    const addImage = () => {
        const url = window.prompt('Enter image URL')
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    const saveToFirestore = async (content) => {
        if (!user) return

        try {
            await setDoc(doc(db, 'documents', docId), {
                content,
                userId: user.uid,
                updatedAt: new Date().toISOString(),
                createdBy: user.displayName,
                userEmail: user.email
            })
        } catch (error) {
            console.error('Error saving document:', error)
        }
    }

    useEffect(() => {
        const loadDocument = async () => {
            if (user && editor) {
                try {
                    const docRef = doc(db, 'documents', docId)
                    const docSnap = await getDoc(docRef)
                    
                    if (docSnap.exists()) {
                        editor.commands.setContent(docSnap.data().content)
                    }
                } catch (error) {
                    console.error('Error loading document:', error)
                }
            }
        }

        loadDocument()
    }, [user, editor, docId])

    if (!user) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Sign in to start writing</h2>
                    <p className="text-gray-600 text-lg max-w-md mx-auto">
                        Join our community of writers and create impactful content together.
                    </p>
                </motion.div>
            </div>
        )
    }

    return (
        <motion.div 
            className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Header Section remains same */}

                {/* Editor Container */}
                <motion.div 
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {/* Formatting Toolbar */}
                    <div className="border-b border-gray-100 p-2 bg-gradient-to-r from-gray-50 to-white flex items-center space-x-2 overflow-x-auto">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                                editor?.isActive('bold') ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 100-8H6v8zm0 0h8a4 4 0 110 8H6v-8z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                                editor?.isActive('italic') ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                                editor?.isActive('underline') ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19h16M7 4v8a5 5 0 0010 0V4" />
                            </svg>
                        </button>
                        <div className="h-6 w-px bg-gray-200" />
                        <select
                            onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                            className="text-sm border border-gray-200 rounded px-2 py-1 text-gray-600 focus:outline-none focus:border-gray-300"
                        >
                            <option value="Inter">Default</option>
                            <option value="serif">Serif</option>
                            <option value="monospace">Monospace</option>
                        </select>
                        <div className="h-6 w-px bg-gray-200" />
                        <button
                            onClick={addImage}
                            className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <input
                            type="color"
                            onInput={e => editor.chain().focus().setColor(e.target.value).run()}
                            className="w-8 h-8 rounded border border-gray-200 p-1 cursor-pointer"
                            value={editor?.getAttributes('textStyle').color || '#000000'}
                        />
                    </div>

                    {/* User Info Section */}
                    <div className="border-b border-gray-100 p-4 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <img 
                                src={user.photoURL} 
                                alt={user.displayName} 
                                className="w-8 h-8 rounded-full border border-gray-200"
                            />
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">{user.displayName}</h3>
                                <p className="text-xs text-gray-500">Editing now</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Auto-saving</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Editor Content */}
                    <div className="bg-white">
                        <style>
                            {`
                                .ProseMirror {
                                    outline: none;
                                    min-height: 500px;
                                }
                                .ProseMirror img {
                                    max-width: 100%;
                                    height: auto;
                                    margin: 1rem 0;
                                    border-radius: 0.5rem;
                                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                                }
                                .ProseMirror p {
                                    margin: 0.5em 0;
                                }
                                .ProseMirror > * + * {
                                    margin-top: 0.75em;
                                }
                            `}
                        </style>
                        <EditorContent editor={editor} />
                    </div>

                    {/* Editor Footer */}
                    <div className="border-t border-gray-100 p-3 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex justify-between items-center text-xs text-gray-500">
                            <div className="flex items-center space-x-4">
                                <span>Press / for commands</span>
                                <span>⌘ + B for bold</span>
                                <span>⌘ + I for italic</span>
                            </div>
                            <div>{wordCount} words</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {editor && (
                <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex items-center space-x-1">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-1 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-100' : ''}`}
                        >
                            B
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-1 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-100' : ''}`}
                        >
                            I
                        </button>
                    </div>
                </BubbleMenu>
            )}
        </motion.div>
    )
}