import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


import Image from '@tiptap/extension-image'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Color from '@tiptap/extension-color'
import { useState, useEffect, useRef } from 'react'
import { db } from '../firebase/FirebaseConfig'
import { doc, setDoc, getDoc, updateDoc, onSnapshot, arrayUnion, arrayRemove } from 'firebase/firestore'
import { useAuth } from '../firebase/AuthContext'
import { motion } from 'framer-motion'
import CharacterCount from '@tiptap/extension-character-count'
import { useLocation, useNavigate } from 'react-router-dom'
import emailjs from '@emailjs/browser'
import {GoogleGenerativeAI} from '@google/generative-ai'

emailjs.init("Qbzg7xNP95oScLfsQ");
export default function Services() {
    const [wordCount, setWordCount] = useState(0)
    const [status, setStatus] = useState('connected')
    const { user } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [docId, setDocId] = useState('')
    const [showCollaborators, setShowCollaborators] = useState(false)
    const [collaboratorEmail, setCollaboratorEmail] = useState('')
    const [collaborators, setCollaborators] = useState([])
    const [activeUsers, setActiveUsers] = useState([])
    const [documentTitle, setDocumentTitle] = useState('Untitled Document')
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const titleInputRef = useRef(null)
    const [lastSaved, setLastSaved] = useState(null)
    const [statusMessage, setStatusMessage] = useState('')
    const [isOwner, setIsOwner] = useState(false)
    const [showAIChat, setShowAIChat] = useState(false);
const [aiInput, setAiInput] = useState('');
const [aiResponse, setAiResponse] = useState('');
const [grammarErrors, setGrammarErrors] = useState([]);
const [grammarCorrections, setGrammarCorrections] = useState([]);
   
      
const apiKey = 'AIzaSyAF84XF9MkNxQ0P7i1eGxc-Lx--78okLj8';
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",  // Changed from gemini-2.0-flash to gemini-pro
    systemInstruction: "You are an AI assistant that helps users modify text based on their specific requests. You will be given an input text as context and a user request specifying the type of modification needed. Your task is to apply the requested changes while maintaining coherence, clarity, and natural language flow. Ensure that the modified text aligns with the given instructions while preserving the original meaning unless stated otherwise.\n\nExamples of modifications include:\n\nMaking the text more formal or informal\nSimplifying complex sentences for better readability\nEnhancing conciseness or expanding details\nImproving grammar, clarity, and fluency\nAdapting the tone for a specific audience\nAlways return only the modified text without additional commentary unless explicitly requested. If the user's request is unclear, seek clarification before proceeding",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
};

  
  const apiKey1 = 'AIzaSyBpjPYh02T0Jcnj21yFUAgtJgQ2zcqrG4A';
  const genAI1 = new GoogleGenerativeAI(apiKey);
  
  const model1 = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "You will receive a piece of text. Identify the parts that contain grammatical errors and provide corrections. Output two arrays with incorrect and correct parts in the same order of occurrence. Maintain the original meaning while ensuring grammatical correctness.",
  });
  
  const generationConfig1 = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  const downloadAsPDF = async () => {
    const content = document.querySelector('.ProseMirror');
    const canvas = await html2canvas(content);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${documentTitle}.pdf`);
};

  const handleGrammarCheck = async () => {
    if (!editor) return;
    
    try {
        const currentContent = editor.getText();
        const prompt = `Analyze this text for grammar errors and return a JSON response in this exact format: {"incorrect": ["error1", "error2"], "correct": ["correction1", "correction2"]}. Text to analyze: ${currentContent}`;
        
        const result = await model1.generateContent(prompt);
        const response = await result.response.text();
        
        try {
            // Find JSON content within the response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const { incorrect, correct } = JSON.parse(jsonMatch[0]);
                setGrammarErrors(incorrect);
                setGrammarCorrections(correct);
                
                // Highlight errors in the editor
                const content = editor.getText();
                const highlightedContent = content.split(' ').map(word => 
                    incorrect.includes(word) 
                        ? `<span class="bg-red-200">${word}</span>` 
                        : word
                ).join(' ');
                
                editor.commands.setContent(highlightedContent);
                saveToFirestore(highlightedContent);
            } else {
                console.error('No valid JSON found in response');
            }
        } catch (parseError) {
            console.error('Error parsing grammar response:', parseError);
        }
    } catch (error) {
        console.error('Error checking grammar:', error);
    }
};
// Update the handleAIRequest function
const handleAIRequest = async () => {
    if (!editor || !aiInput) return;
    
    try {
        const currentContent = editor.getText();
        const chatSession = model.startChat({
            generationConfig,
        });

        const prompt = `${currentContent}\n${aiInput}`;
        const result = await chatSession.sendMessage(prompt);
        const modifiedText = result.response.text();
        
        setAiResponse(modifiedText);
        
        // Optionally, update the editor content with the AI response
        if (modifiedText) {
            editor.commands.setContent(modifiedText);
            saveToFirestore(modifiedText)
        }
    } catch (error) {
        console.error('Error processing AI request:', error);
        setAiResponse('Error processing your request');
    }
};
    // Extract docId from URL if present
   
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const docIdFromUrl = params.get('doc')
        
        if (docIdFromUrl) {
            setDocId(docIdFromUrl)
        } else {
            const newDocId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            setDocId(newDocId)
            
            // Update URL with the new document ID without page reload
            const newUrl = `${window.location.pathname}?doc=${newDocId}`
            window.history.pushState({ path: newUrl }, '', newUrl)
        }
    }, [location.search])

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
    const sendCollaborationEmail = async (collaboratorEmail, documentTitle, ownerName) => {
        try {
            const emailParams = {
                service_id: 'service_6gyspyc',
                template_id: 'template_2shuxj3',
                user_id: 'Qbzg7xNP95oScLfsQ',
                template_params: {
                    to_email: collaboratorEmail,
                    to_name: collaboratorEmail.split('@')[0],
                    from_name: ownerName,
                    message: `I've shared a document titled "${documentTitle}" with you. You can access it by logging into your account.`,
                }
            };
    
            const response = await emailjs.send(
                emailParams.service_id,
                emailParams.template_id,
                emailParams.template_params,
                emailParams.user_id
            );
    
            return response.status === 200;
        } catch (error) {
            console.error('Error sending collaboration email:', error);
            return false;
        }
    };
    const addImage = () => {
        const url = window.prompt('Enter image URL')
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    const saveToFirestore = async (content) => {
        if (!user || !docId) return

        try {
            const now = new Date().toISOString()
            const docRef = doc(db, 'documents', docId)
            const docSnap = await getDoc(docRef)
            
            if (docSnap.exists()) {
                // Update existing document
                await updateDoc(docRef, {
                    content,
                    updatedAt: now,
                    lastEditedBy: user.displayName,
                })
            } else {
                // Create new document
                await setDoc(docRef, {
                    content,
                    userId: user.uid,
                    createdAt: now,
                    updatedAt: now,
                    createdBy: user.displayName,
                    userEmail: user.email,
                    title: documentTitle,
                    collaborators: [],
                    activeUsers: []
                })
                setIsOwner(true)
            }
            
            setLastSaved(new Date())
            setStatus('saved')
            
            // Update user's active status
            updateUserActivity()
            
        } catch (error) {
            console.error('Error saving document:', error)
            setStatus('error')
        }
    }
    
    const updateUserActivity = async () => {
        if (!user || !docId) return
        
        try {
            const docRef = doc(db, 'documents', docId)
            const docSnap = await getDoc(docRef)
            
            if (docSnap.exists()) {
                const data = docSnap.data()
                const now = new Date().toISOString()
                
                // Check if user is already in activeUsers array
                const existingActiveUsers = data.activeUsers || []
                const userIndex = existingActiveUsers.findIndex(u => u.uid === user.uid)
                
                if (userIndex >= 0) {
                    // User exists, update their lastActive time
                    existingActiveUsers[userIndex].lastActive = now
                    await updateDoc(docRef, { activeUsers: existingActiveUsers })
                } else {
                    // User doesn't exist, add them
                    await updateDoc(docRef, {
                        activeUsers: [...existingActiveUsers, {
                            uid: user.uid,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            lastActive: now
                        }]
                    })
                }
            }
        } catch (error) {
            console.error('Error updating user activity:', error)
        }
    }
    
    const removeUserActivity = async () => {
        if (!user || !docId) return
        
        try {
            const docRef = doc(db, 'documents', docId)
            const docSnap = await getDoc(docRef)
            
            if (docSnap.exists()) {
                const data = docSnap.data()
                const existingActiveUsers = data.activeUsers || []
                
                // Filter out this user
                const updatedActiveUsers = existingActiveUsers.filter(u => u.uid !== user.uid)
                
                await updateDoc(docRef, {
                    activeUsers: updatedActiveUsers
                })
            }
        } catch (error) {
            console.error('Error removing user activity:', error)
        }
    }

    const addCollaborator = async () => {
        if (!collaboratorEmail || !docId) return
        
        // Don't add if it's the current user's email
        if (collaboratorEmail === user.email) {
            setStatusMessage("You can't add yourself as a collaborator")
            setTimeout(() => setStatusMessage(''), 3000)
            return
        }
        
        try {
            const docRef = doc(db, 'documents', docId)
            const docSnap = await getDoc(docRef)
            
            if (docSnap.exists()) {
                const data = docSnap.data()
                
                // Check if email is already a collaborator
                if (data.collaborators && data.collaborators.includes(collaboratorEmail)) {
                    setStatusMessage('This person is already a collaborator')
                    setTimeout(() => setStatusMessage(''), 3000)
                    return
                }
                
                // Add the collaborator
                await updateDoc(docRef, {
                    collaborators: arrayUnion(collaboratorEmail)
                })
                const emailSent = await sendCollaborationEmail(
                    collaboratorEmail,
                    documentTitle,
                    user.displayName || user.email
                );
                setCollaboratorEmail('')
                setStatusMessage('Collaborator added successfully')
                setTimeout(() => setStatusMessage(''), 3000)
            }
        } catch (error) {
            console.error('Error adding collaborator:', error)
            setStatusMessage('Error adding collaborator')
            setTimeout(() => setStatusMessage(''), 3000)
        }
    }
    
    const removeCollaborator = async (email) => {
        if (!email || !docId) return
        
        try {
            const docRef = doc(db, 'documents', docId)
            
            await updateDoc(docRef, {
                collaborators: arrayRemove(email)
            })
            
            setStatusMessage('Collaborator removed')
            setTimeout(() => setStatusMessage(''), 3000)
        } catch (error) {
            console.error('Error removing collaborator:', error)
            setStatusMessage('Error removing collaborator')
            setTimeout(() => setStatusMessage(''), 3000)
        }
    }
    
    const updateDocumentTitle = async () => {
        if (!docId) return
        
        try {
            const docRef = doc(db, 'documents', docId)
            
            await updateDoc(docRef, {
                title: documentTitle
            })
            
            setIsEditingTitle(false)
            setStatusMessage('Title updated')
            setTimeout(() => setStatusMessage(''), 3000)
        } catch (error) {
            console.error('Error updating title:', error)
            setStatusMessage('Error updating title')
            setTimeout(() => setStatusMessage(''), 3000)
        }
    }

    // Listen for document changes
    useEffect(() => {
        if (!docId || !user) return
        
        const docRef = doc(db, 'documents', docId)
        
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists() && editor) {
                const data = docSnap.data()
                
                // Only update content if it was changed by someone else
                if (data.lastEditedBy && data.lastEditedBy !== user.displayName) {
                    const currentSelection = editor.view.state.selection
                    editor.commands.setContent(data.content)
                    
                    // Try to restore cursor position
                    if (currentSelection) {
                        editor.commands.setTextSelection(currentSelection.from)
                    }
                }
                
                // Update other document metadata
                setDocumentTitle(data.title || 'Untitled Document')
                setCollaborators(data.collaborators || [])
                
                // Check if user is owner
                setIsOwner(data.userId === user.uid)
                
                // Update active users
                if (data.activeUsers) {
                    // Filter out inactive users (more than 5 minutes)
                    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
                    const filteredUsers = data.activeUsers.filter(u => 
                        u.lastActive && u.lastActive > fiveMinutesAgo
                    )
                    setActiveUsers(filteredUsers)
                }
            }
        }, (error) => {
            console.error("Error in document snapshot listener:", error)
        })
        
        // Update user activity when joining
        const interval = setInterval(updateUserActivity, 30000) // Update every 30 seconds
        updateUserActivity()
        
        // Remove user from active users when leaving
        return () => {
            removeUserActivity()
            unsubscribe()
            clearInterval(interval)
        }
    }, [docId, user, editor])

    // Load document content
    useEffect(() => {
        const loadDocument = async () => {
            if (!user || !editor || !docId) return
            
            try {
                const docRef = doc(db, 'documents', docId)
                const docSnap = await getDoc(docRef)
                
                if (docSnap.exists()) {
                    const data = docSnap.data()
                    editor.commands.setContent(data.content)
                    setDocumentTitle(data.title || 'Untitled Document')
                    setCollaborators(data.collaborators || [])
                    setIsOwner(data.userId === user.uid)
                    
                    // Check if user has access
                    const isOwner = data.userId === user.uid
                    const isCollaborator = data.collaborators && data.collaborators.includes(user.email)
                    
                    if (!isOwner && !isCollaborator) {
                        setStatus('no-access')
                        editor.setEditable(false)
                    }
                }
            } catch (error) {
                console.error('Error loading document:', error)
                setStatus('error')
            }
        }

        loadDocument()
    }, [user, editor, docId])

    // Focus title input when editing
    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus()
        }
    }, [isEditingTitle])

    // Handle beforeunload to remove user from active users
    useEffect(() => {
        const handleBeforeUnload = () => {
            removeUserActivity()
        }
        
        window.addEventListener('beforeunload', handleBeforeUnload)
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [docId, user])

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

    if (status === 'no-access') {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V9m0 0V7m0 2h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">
                        You don't have permission to access this document. Please ask the owner to add you as a collaborator.
                    </p>
                    <button
                        onClick={() => navigate('/user-docs')}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
                    >
                                                Back to My Documents
                    </button>
                </div>
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
          
{showAIChat && (
    <div className="fixed botton-2 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">AI Assistant</h3>
            <button 
                onClick={() => setShowAIChat(false)}
                className="text-gray-500 hover:text-gray-900"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto">
            {aiResponse && (
                <div className="mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 mb-3">{aiResponse}</p>
                        <div className="flex space-x-2 mt-2">
                            <button
                                onClick={() => {
                                    editor.commands.setContent(aiResponse);
                                    setAiResponse('');
                                    setAiInput('');
                                }}
                                className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => setAiResponse('')}
                                className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                </div>
            )}
            

            <div className="flex space-x-2">
                <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Enter your request..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <button
                    onClick={handleAIRequest}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
                >
                    Send
                </button>
            </div>
        </div>
    </div>
)}
    {grammarErrors.length > 0 && (
                <div className="fixed top-24 right-[420px] w-96 bg-white rounded-lg shadow-xl border border-gray-200">
                    <div className="flex justify-between items-center p-4 border-b border-gray-200">
                        <h3 className="font-medium text-gray-900">Grammar Suggestions</h3>
                        <button 
                            onClick={() => {
                                setGrammarErrors([]);
                                setGrammarCorrections([]);
                            }}
                            className="text-gray-500 hover:text-gray-900"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-4 max-h-96 overflow-y-auto">
                        {grammarErrors.map((error, index) => (
                            <div key={index} className="mb-3 p-2 bg-gray-50 rounded">
                                <p className="text-red-500 line-through mb-1">{error}</p>
                                <p className="text-green-600">{grammarCorrections[index]}</p>
                                <button
                                    onClick={() => {
                                        const content = editor.getText();
                                        editor.commands.setContent(
                                            content.replace(error, grammarCorrections[index])
                                        );
                                        saveToFirestore(newContent); 
                                    }}
                                    className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Replace
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Document Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex-1">
                        {isEditingTitle ? (
                            <input
                                ref={titleInputRef}
                                type="text"
                                value={documentTitle}
                                onChange={(e) => setDocumentTitle(e.target.value)}
                                onBlur={updateDocumentTitle}
                                onKeyDown={(e) => e.key === 'Enter' && updateDocumentTitle()}
                                className="text-3xl font-bold text-gray-900 border-b-2 border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent w-full max-w-xl"
                                placeholder="Document Title"
                            />
                        ) : (
                            <h1 
                                className="text-3xl font-bold text-gray-900 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors inline-flex items-center"
                                onClick={() => setIsEditingTitle(true)}
                            >
                                {documentTitle}
                                <svg className="w-5 h-5 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </h1>
                        )}
                    </div>

                    {/* Collaboration Controls */}
                    <div className="flex items-center space-x-4">
                        <div className="flex -space-x-2">
                            {activeUsers.slice(0, 3).map((activeUser) => (
                                <div key={activeUser.uid} className="relative">
                                    <img 
                                        src={activeUser.photoURL} 
                                        alt={activeUser.displayName}
                                        className="w-8 h-8 rounded-full border-2 border-white"
                                        title={activeUser.displayName}
                                    />
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                            ))}
                            {activeUsers.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600 border-2 border-white">
                                    +{activeUsers.length - 3}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowCollaborators(!showCollaborators)}
                            className="px-3 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-900 transition-all duration-300 flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span>Share</span>
                        </button>
                    </div>
                </div>

                {/* Status Message */}
                {statusMessage && (
                    <div className="mb-4">
                        <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm">
                            {statusMessage}
                        </div>
                    </div>
                )}

                {/* Collaborators Panel */}
                {showCollaborators && (
                    <motion.div 
                        className="mb-6 bg-white rounded-xl shadow-lg border border-gray-200 p-4"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium text-gray-900">Share with others</h3>
                            <button 
                                onClick={() => setShowCollaborators(false)}
                                className="text-gray-500 hover:text-gray-900"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-4">
                            <input
                                type="email"
                                value={collaboratorEmail}
                                onChange={(e) => setCollaboratorEmail(e.target.value)}
                                placeholder="Add people by email"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            />
                            <button
                                onClick={addCollaborator}
                                disabled={!collaboratorEmail}
                                className={`px-4 py-2 rounded-lg ${
                                    collaboratorEmail 
                                        ? 'bg-black text-white hover:bg-gray-900' 
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                } transition-colors`}
                            >
                                Add
                            </button>
                        </div>
                        
                        {collaborators.length > 0 ? (
                            <div className="space-y-3 max-h-48 overflow-y-auto">
                                <h4 className="text-sm font-medium text-gray-500">People with access</h4>
                                {collaborators.map((email) => (
                                    <div key={email} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                {email.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm text-gray-900">{email}</span>
                                        </div>
                                        <button
                                            onClick={() => removeCollaborator(email)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                                No collaborators yet. Add someone to collaborate on this document.
                            </div>
                        )}
                    </motion.div>
                )}

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
                        <button
    onClick={handleGrammarCheck}
    className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
    title="Check Grammar"
>
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
</button>
                        <button
    onClick={() => setShowAIChat(!showAIChat)}
    className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
>
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
</button>
<button
                onClick={downloadAsPDF}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
            >
                Download as PDF
            </button>
                        <input
                            type="color"
                            onInput={e => editor.chain().focus().setColor(e.target.value).run()}
                            className="w-8 h-8 rounded border border-gray-200 p-1 cursor-pointer"
                            value={editor?.getAttributes('textStyle').color || '#000000'}
                        />
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

