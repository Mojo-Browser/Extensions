/**

 * Quick Notes Add-On for Mojo Browser

 * Version: 1.1.0

 * Author: MojoX Team

 */

// @Name : Quick Notes

(function() {


    if (window.QuickNotesInitialized) {

        console.log('[QuickNotes] Already initialized, skipping.');

        return;

    }

    window.QuickNotesInitialized = true;

    console.log('[QuickNotes] Initializing version 1.1.0');




    const PRIMARY_COLOR = '#3B82F6';

    const BUTTON_HOVER_COLOR = '#60A5FA';

    const BUTTON_PRESSED_COLOR = '#2563EB';

    const TEXT_COLOR = '#ffffff';

    const LIGHT_MODE_ACCENT = '#F3F4F6';

    const DARK_MODE_ACCENT = '#2D3748';

    const DARK_MODE_TEXT = '#E2E8F0';

    const BORDER_RADIUS = '8px';

    const CLEAR_BUTTON_COLOR = '#EF4444';

    const CLEAR_BUTTON_HOVER = '#F87171';

    const CLEAR_BUTTON_PRESSED = '#DC2626';

    const SUCCESS_COLOR = '#10B981';




    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    let isDarkMode = localStorage.getItem('quickNotesDarkMode') === 'true' || prefersDarkMode;




    const style = document.createElement('style');

    function updateStyles() {

        const bgColor = isDarkMode ? DARK_MODE_ACCENT : LIGHT_MODE_ACCENT;

        const textColor = isDarkMode ? DARK_MODE_TEXT : '#333333';

        const inputBgColor = isDarkMode ? '#1A202C' : '#FFFFFF';

        const borderColor = isDarkMode ? '#4A5568' : '#D1D5DB';



        style.textContent = `

            .quick-notes-container {

                position: fixed;

                bottom: 20px;

                right: 20px;

                z-index: 10000;

                background: ${bgColor};

                border-radius: ${BORDER_RADIUS};

                padding: 12px;

                box-shadow: 0 4px 12px rgba(0, 0, 0, ${isDarkMode ? '0.4' : '0.1'});

                width: 300px;

                font-family: "Nunito", Arial, sans-serif;

                font-size: 14px;

                transition: all 0.3s ease;

                border: 1px solid ${borderColor};

                resize: both;

                overflow: hidden;

                min-width: 250px;

                min-height: 150px;

                max-width: 500px;

                max-height: 80vh;

            }

            .quick-notes-container.minimized {

                transform: translateY(calc(100% - 40px));

                resize: none;

            }

            .quick-notes-header {

                display: flex;

                justify-content: space-between;

                align-items: center;

                margin-bottom: 8px;

                cursor: move;

                padding-bottom: 6px;

                border-bottom: 1px solid ${borderColor};

                color: ${textColor};

            }

            .quick-notes-title {

                font-weight: bold;

                font-size: 15px;

                margin: 0;

            }

            .quick-notes-controls {

                display: flex;

                gap: 8px;

            }

            .quick-notes-icon-button {

                background: transparent;

                border: none;

                cursor: pointer;

                width: 24px;

                height: 24px;

                display: flex;

                align-items: center;

                justify-content: center;

                color: ${textColor};

                opacity: 0.7;

                transition: opacity 0.2s ease, transform 0.1s ease;

                border-radius: 4px;

            }

            .quick-notes-icon-button:hover {

                opacity: 1;

                background: rgba(0, 0, 0, 0.05);

            }

            .quick-notes-icon-button:active {

                transform: scale(0.9);

            }

            .quick-notes-textarea {

                width: 100%;

                height: calc(100% - 80px);

                border: 1px solid ${borderColor};

                border-radius: 5px;

                padding: 8px;

                resize: none;

                font-family: inherit;

                font-size: 14px;

                background: ${inputBgColor};

                color: ${textColor};

                line-height: 1.5;

            }

            .quick-notes-button {

                padding: 6px 12px;

                background: ${CLEAR_BUTTON_COLOR};

                color: ${TEXT_COLOR};

                border: none;

                border-radius: 5px;

                cursor: pointer;

                font-size: 14px;

                transition: background 0.2s ease, transform 0.1s ease;

            }

            .quick-notes-button:hover {

                background: ${CLEAR_BUTTON_HOVER};

                transform: scale(1.05);

            }

            .quick-notes-button:active {

                background: ${CLEAR_BUTTON_PRESSED};

                transform: scale(0.95);

            }

            .quick-notes-action-button {

                background: ${PRIMARY_COLOR};

            }

            .quick-notes-action-button:hover {

                background: ${BUTTON_HOVER_COLOR};

            }

            .quick-notes-action-button:active {

                background: ${BUTTON_PRESSED_COLOR};

            }

            .quick-notes-footer {

                display: flex;

                justify-content: space-between;

                margin-top: 8px;

                flex-wrap: wrap;

                gap: 8px;

            }

            .quick-notes-toolbar {

                display: flex;

                gap: 4px;

                margin-bottom: 8px;

            }

            .toolbar-button {

                padding: 4px 8px;

                border: 1px solid ${borderColor};

                background: ${inputBgColor};

                border-radius: 4px;

                cursor: pointer;

                color: ${textColor};

                font-size: 12px;

            }

            .toolbar-button:hover {

                background: ${isDarkMode ? '#2D3748' : '#E5E7EB'};

            }

            .quick-notes-message {

                position: fixed;

                bottom: 80px;

                right: 20px;

                background: ${SUCCESS_COLOR};

                color: white;

                padding: 8px 12px;

                border-radius: 4px;

                opacity: 0;

                transition: opacity 0.3s ease;

                z-index: 10001;

            }

            .quick-notes-note-selector {

                width: 100%;

                padding: 6px;

                background: ${inputBgColor};

                color: ${textColor};

                border: 1px solid ${borderColor};

                border-radius: 4px;

                margin-bottom: 8px;

            }

            .character-count {

                font-size: 12px;

                opacity: 0.7;

                margin-top: 4px;

                color: ${textColor};

            }

            .dark-mode-toggle {

                margin-right: auto;

            }

            .search-box {

                padding: 6px;

                width: 100%;

                border: 1px solid ${borderColor};

                border-radius: 4px;

                background: ${inputBgColor};

                color: ${textColor};

                margin-bottom: 8px;

                display: none;

            }

            .search-box.active {

                display: block;

            }

        `;

    }



    updateStyles();

    document.head.appendChild(style);



    // Create notes container

    const notesContainer = document.createElement('div');

    notesContainer.className = 'quick-notes-container';



    // Create header with title and controls

    const header = document.createElement('div');

    header.className = 'quick-notes-header';

    

    const title = document.createElement('p');

    title.className = 'quick-notes-title';

    title.textContent = 'Quick Notes';



    const controls = document.createElement('div');

    controls.className = 'quick-notes-controls';




    const savedNotes = JSON.parse(localStorage.getItem('quickNotesData')) || {

        'Default Note': ''

    };

    let currentNote = localStorage.getItem('quickNotesCurrentNote') || 'Default Note';

    


    const searchBox = document.createElement('input');

    searchBox.type = 'text';

    searchBox.className = 'search-box';

    searchBox.placeholder = 'Search in notes...';




    const noteSelector = document.createElement('select');

    noteSelector.className = 'quick-notes-note-selector';

    

    function updateNoteSelector() {

        noteSelector.innerHTML = '';

        Object.keys(savedNotes).forEach(noteName => {

            const option = document.createElement('option');

            option.value = noteName;

            option.textContent = noteName;

            if (noteName === currentNote) {

                option.selected = true;

            }

            noteSelector.appendChild(option);

        });

    }

    


    const notesTextarea = document.createElement('textarea');

    notesTextarea.className = 'quick-notes-textarea';

    notesTextarea.placeholder = 'Write your notes here...';

    notesTextarea.value = savedNotes[currentNote] || '';

    notesTextarea.spellcheck = true;




    const characterCount = document.createElement('div');

    characterCount.className = 'character-count';

    characterCount.textContent = `${notesTextarea.value.length} characters`;




    const toolbar = document.createElement('div');

    toolbar.className = 'quick-notes-toolbar';

    

    const boldButton = createToolbarButton('B', 'Bold');

    const italicButton = createToolbarButton('I', 'Italic');

    const underlineButton = createToolbarButton('U', 'Underline');

    const listButton = createToolbarButton('• List', 'Bullet List');

    const timeButton = createToolbarButton('🕒', 'Insert Timestamp');



    function createToolbarButton(text, title) {

        const button = document.createElement('button');

        button.className = 'toolbar-button';

        button.textContent = text;

        button.title = title;

        toolbar.appendChild(button);

        return button;

    }




    const message = document.createElement('div');

    message.className = 'quick-notes-message';

    document.body.appendChild(message);



    function showMessage(text, duration = 2000) {

        message.textContent = text;

        message.style.opacity = '1';

        setTimeout(() => {

            message.style.opacity = '0';

        }, duration);

    }




    const darkModeButton = document.createElement('button');

    darkModeButton.className = 'quick-notes-icon-button dark-mode-toggle';

    darkModeButton.innerHTML = isDarkMode ? '☀️' : '🌙';

    darkModeButton.title = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';




    const toggleButton = document.createElement('button');

    toggleButton.className = 'quick-notes-button quick-notes-action-button';

    toggleButton.textContent = 'Minimize';




    const addNoteButton = document.createElement('button');

    addNoteButton.className = 'quick-notes-button quick-notes-action-button';

    addNoteButton.textContent = '+ New Note';




    const deleteNoteButton = document.createElement('button');

    deleteNoteButton.className = 'quick-notes-button';

    deleteNoteButton.textContent = 'Delete Note';




    const clearButton = document.createElement('button');

    clearButton.className = 'quick-notes-button';

    clearButton.textContent = 'Clear';




    const exportButton = document.createElement('button');

    exportButton.className = 'quick-notes-button quick-notes-action-button';

    exportButton.textContent = 'Export';




    const searchButton = document.createElement('button');

    searchButton.className = 'quick-notes-icon-button';

    searchButton.innerHTML = '🔍';

    searchButton.title = 'Search';




    const minimizeButton = document.createElement('button');

    minimizeButton.className = 'quick-notes-icon-button';

    minimizeButton.innerHTML = '—';

    minimizeButton.title = 'Minimize';



    const closeButton = document.createElement('button');

    closeButton.className = 'quick-notes-icon-button';

    closeButton.innerHTML = '✕';

    closeButton.title = 'Hide Notes';




    notesTextarea.addEventListener('input', () => {

        savedNotes[currentNote] = notesTextarea.value;

        localStorage.setItem('quickNotesData', JSON.stringify(savedNotes));

        localStorage.setItem('quickNotesCurrentNote', currentNote);

        console.log('[QuickNotes] Notes saved to localStorage');

        characterCount.textContent = `${notesTextarea.value.length} characters`;

    });




    let isSearchActive = false;

    searchButton.addEventListener('click', () => {

        isSearchActive = !isSearchActive;

        searchBox.classList.toggle('active', isSearchActive);

        if (isSearchActive) {

            searchBox.focus();

        }

    });



    searchBox.addEventListener('input', () => {

        const searchTerm = searchBox.value.toLowerCase();

        if (searchTerm.length > 0) {

            const text = notesTextarea.value;

            const regex = new RegExp(searchTerm, 'gi');

            let match;

            


            notesTextarea.style.color = isDarkMode ? DARK_MODE_TEXT : '#333333';

            


            if (text.toLowerCase().includes(searchTerm)) {


                const firstIndex = text.toLowerCase().indexOf(searchTerm);

                notesTextarea.focus();

                notesTextarea.setSelectionRange(firstIndex, firstIndex + searchTerm.length);

                showMessage(`Found "${searchTerm}" in current note`);

            } else {

                showMessage(`No matches for "${searchTerm}"`);

            }

        }

    });




    darkModeButton.addEventListener('click', () => {

        isDarkMode = !isDarkMode;

        localStorage.setItem('quickNotesDarkMode', isDarkMode);

        darkModeButton.innerHTML = isDarkMode ? '☀️' : '🌙';

        darkModeButton.title = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';

        updateStyles();

        showMessage(`Switched to ${isDarkMode ? 'Dark' : 'Light'} Mode`);

    });




    let isMinimized = false;

    function toggleMinimize() {

        isMinimized = !isMinimized;

        notesContainer.classList.toggle('minimized', isMinimized);

        toggleButton.textContent = isMinimized ? 'Maximize' : 'Minimize';

        minimizeButton.innerHTML = isMinimized ? '□' : '—';

        minimizeButton.title = isMinimized ? 'Maximize' : 'Minimize';

        console.log('[QuickNotes] Toggled to', isMinimized ? 'minimized' : 'maximized');

    }

    

    toggleButton.addEventListener('click', toggleMinimize);

    minimizeButton.addEventListener('click', toggleMinimize);




    clearButton.addEventListener('click', () => {

        if (confirm('Clear the current note?')) {

            notesTextarea.value = '';

            savedNotes[currentNote] = '';

            localStorage.setItem('quickNotesData', JSON.stringify(savedNotes));

            characterCount.textContent = '0 characters';

            showMessage('Note cleared');

            console.log('[QuickNotes] Current note cleared');

        }

    });




    noteSelector.addEventListener('change', () => {

        currentNote = noteSelector.value;

        notesTextarea.value = savedNotes[currentNote] || '';

        localStorage.setItem('quickNotesCurrentNote', currentNote);

        characterCount.textContent = `${notesTextarea.value.length} characters`;

        console.log('[QuickNotes] Switched to note:', currentNote);

    });




    addNoteButton.addEventListener('click', () => {

        const noteName = prompt('Enter a name for the new note:');

        if (noteName && noteName.trim() !== '') {

            if (savedNotes[noteName]) {

                alert('A note with this name already exists.');

                return;

            }

            savedNotes[noteName] = '';

            currentNote = noteName;

            localStorage.setItem('quickNotesData', JSON.stringify(savedNotes));

            localStorage.setItem('quickNotesCurrentNote', currentNote);

            updateNoteSelector();

            notesTextarea.value = '';

            characterCount.textContent = '0 characters';

            showMessage(`Created new note: ${noteName}`);

            console.log('[QuickNotes] Created new note:', noteName);

        }

    });




    deleteNoteButton.addEventListener('click', () => {

        if (Object.keys(savedNotes).length <= 1) {

            alert('You cannot delete the last remaining note.');

            return;

        }

        

        if (confirm(`Delete the note "${currentNote}"?`)) {

            delete savedNotes[currentNote];

            currentNote = Object.keys(savedNotes)[0];

            localStorage.setItem('quickNotesData', JSON.stringify(savedNotes));

            localStorage.setItem('quickNotesCurrentNote', currentNote);

            updateNoteSelector();

            notesTextarea.value = savedNotes[currentNote] || '';

            characterCount.textContent = `${notesTextarea.value.length} characters`;

            showMessage(`Deleted note: ${currentNote}`);

            console.log('[QuickNotes] Deleted note');

        }

    });




    exportButton.addEventListener('click', () => {


        const notesContent = Object.entries(savedNotes)

            .map(([name, content]) => `# ${name}\n\n${content}\n\n---\n\n`)

            .join('');

        

        const blob = new Blob([notesContent], { type: 'text/plain' });

        const url = URL.createObjectURL(blob);

        


        const a = document.createElement('a');

        a.href = url;

        a.download = 'quick-notes-export.txt';

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        

        showMessage('Notes exported successfully');

        console.log('[QuickNotes] Notes exported');

    });




    closeButton.addEventListener('click', () => {

        notesContainer.style.display = 'none';

        console.log('[QuickNotes] Notes hidden');

        


        const showButton = document.createElement('button');

        showButton.textContent = '📝';

        showButton.style.position = 'fixed';

        showButton.style.bottom = '20px';

        showButton.style.right = '20px';

        showButton.style.background = PRIMARY_COLOR;

        showButton.style.color = TEXT_COLOR;

        showButton.style.border = 'none';

        showButton.style.borderRadius = '50%';

        showButton.style.width = '40px';

        showButton.style.height = '40px';

        showButton.style.fontSize = '20px';

        showButton.style.cursor = 'pointer';

        showButton.style.zIndex = '10000';

        showButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

        showButton.title = 'Show Quick Notes';

        

        showButton.addEventListener('click', () => {

            notesContainer.style.display = 'block';

            document.body.removeChild(showButton);

        });

        

        document.body.appendChild(showButton);

    });




    let isDragging = false;

    let offsetX, offsetY;



    header.addEventListener('mousedown', (e) => {

        isDragging = true;

        offsetX = e.clientX - notesContainer.getBoundingClientRect().left;

        offsetY = e.clientY - notesContainer.getBoundingClientRect().top;

        


        document.addEventListener('mousemove', onMouseMove);

        document.addEventListener('mouseup', onMouseUp);

        


        e.preventDefault();

    });



    function onMouseMove(e) {

        if (isDragging) {

            const x = e.clientX - offsetX;

            const y = e.clientY - offsetY;

            


            const maxX = window.innerWidth - notesContainer.offsetWidth;

            const maxY = window.innerHeight - notesContainer.offsetHeight;

            

            notesContainer.style.left = `${Math.max(0, Math.min(maxX, x))}px`;

            notesContainer.style.top = `${Math.max(0, Math.min(maxY, y))}px`;

            notesContainer.style.right = 'auto';

            notesContainer.style.bottom = 'auto';

        }

    }



    function onMouseUp() {

        isDragging = false;

        document.removeEventListener('mousemove', onMouseMove);

        document.removeEventListener('mouseup', onMouseUp);

    }




    boldButton.addEventListener('click', () => {

        insertFormatting('**', '**');

    });

    

    italicButton.addEventListener('click', () => {

        insertFormatting('_', '_');

    });

    

    underlineButton.addEventListener('click', () => {

        insertFormatting('<u>', '</u>');

    });

    

    listButton.addEventListener('click', () => {

        const start = notesTextarea.selectionStart;

        const end = notesTextarea.selectionEnd;

        const selectedText = notesTextarea.value.substring(start, end);

        


        const lines = selectedText.split('\n');

        const formattedText = lines.map(line => line.trim() ? `• ${line}` : line).join('\n');

        

        notesTextarea.value = 

            notesTextarea.value.substring(0, start) + 

            formattedText + 

            notesTextarea.value.substring(end);

            


        savedNotes[currentNote] = notesTextarea.value;

        localStorage.setItem('quickNotesData', JSON.stringify(savedNotes));

        characterCount.textContent = `${notesTextarea.value.length} characters`;

    });

    

    timeButton.addEventListener('click', () => {

        const now = new Date();

        const timestamp = now.toLocaleString();

        insertAtCursor(`[${timestamp}] `);

    });



    function insertFormatting(prefix, suffix) {

        const start = notesTextarea.selectionStart;

        const end = notesTextarea.selectionEnd;

        const selectedText = notesTextarea.value.substring(start, end);

        

        notesTextarea.value = 

            notesTextarea.value.substring(0, start) + 

            prefix + selectedText + suffix + 

            notesTextarea.value.substring(end);

            


        savedNotes[currentNote] = notesTextarea.value;

        localStorage.setItem('quickNotesData', JSON.stringify(savedNotes));

        characterCount.textContent = `${notesTextarea.value.length} characters`;

        


        notesTextarea.selectionStart = notesTextarea.selectionEnd = end + prefix.length + selectedText.length;

        notesTextarea.focus();

    }

    

    function insertAtCursor(text) {

        const start = notesTextarea.selectionStart;

        

        notesTextarea.value = 

            notesTextarea.value.substring(0, start) + 

            text + 

            notesTextarea.value.substring(start);

            


        savedNotes[currentNote] = notesTextarea.value;

        localStorage.setItem('quickNotesData', JSON.stringify(savedNotes));

        characterCount.textContent = `${notesTextarea.value.length} characters`;

        


        notesTextarea.selectionStart = notesTextarea.selectionEnd = start + text.length;

        notesTextarea.focus();

    }




    notesTextarea.addEventListener('keydown', (e) => {


        if (e.ctrlKey && e.key === 'b') {

            e.preventDefault();

            insertFormatting('**', '**');

        }


        else if (e.ctrlKey && e.key === 'i') {

            e.preventDefault();

            insertFormatting('_', '_');

        }


        else if (e.ctrlKey && e.key === 'u') {

            e.preventDefault();

            insertFormatting('<u>', '</u>');

        }


        else if (e.ctrlKey && e.key === 'l') {

            e.preventDefault();

            listButton.click();

        }


        else if (e.ctrlKey && e.key === 's') {

            e.preventDefault();

            showMessage('Note saved automatically');

        }

    });




    let saveTimeout;

    notesTextarea.addEventListener('keyup', () => {

        clearTimeout(saveTimeout);

        saveTimeout = setTimeout(() => {

            const dot = document.createElement('span');

            dot.style.position = 'absolute';

            dot.style.right = '5px';

            dot.style.bottom = '5px';

            dot.style.width = '8px';

            dot.style.height = '8px';

            dot.style.borderRadius = '50%';

            dot.style.background = SUCCESS_COLOR;

            dot.style.opacity = '1';

            dot.style.transition = 'opacity 1s ease';

            

            notesContainer.appendChild(dot);

            

            setTimeout(() => {

                dot.style.opacity = '0';

                setTimeout(() => {

                    if (dot.parentNode) {

                        notesContainer.removeChild(dot);

                    }

                }, 1000);

            }, 1000);

        }, 500);

    });




    controls.appendChild(darkModeButton);

    controls.appendChild(searchButton);

    controls.appendChild(minimizeButton);

    controls.appendChild(closeButton);

    

    header.appendChild(title);

    header.appendChild(controls);

    

    const footerLeft = document.createElement('div');

    footerLeft.appendChild(addNoteButton);

    footerLeft.appendChild(exportButton);

    

    const footerRight = document.createElement('div');

    footerRight.appendChild(deleteNoteButton);

    footerRight.appendChild(clearButton);

    

    const footer = document.createElement('div');

    footer.className = 'quick-notes-footer';

    footer.appendChild(footerLeft);

    footer.appendChild(footerRight);



    notesContainer.appendChild(header);

    notesContainer.appendChild(searchBox);

    notesContainer.appendChild(noteSelector);

    notesContainer.appendChild(toolbar);

    notesContainer.appendChild(notesTextarea);

    notesContainer.appendChild(characterCount);

    notesContainer.appendChild(footer);

    

    document.body.appendChild(notesContainer);

    


    updateNoteSelector();

    


    let autoHideTimeout;

    const resetAutoHide = () => {

        clearTimeout(autoHideTimeout);

        notesContainer.style.opacity = '1';

        


        if (isMinimized) {

            autoHideTimeout = setTimeout(() => {

                notesContainer.style.opacity = '0.3';

            }, 3000);

        }

    };

    

    notesContainer.addEventListener('mouseenter', () => {

        clearTimeout(autoHideTimeout);

        notesContainer.style.opacity = '1';

    });

    

    notesContainer.addEventListener('mouseleave', resetAutoHide);

    


    resetAutoHide();

    


    const currentVersion = '1.1.0';

    const lastVersion = localStorage.getItem('quickNotesVersion');

    

    if (lastVersion !== currentVersion) {

        showMessage(`Updated to version ${currentVersion}`, 3000);

        localStorage.setItem('quickNotesVersion', currentVersion);

    }

    

    console.log('[QuickNotes] Initialization complete');

})();
