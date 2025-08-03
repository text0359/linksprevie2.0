// Este arquivo contém a lógica principal de inicialização do aplicativo e os event listeners.
// Ele depende de 'config.js', 'database.js' e 'functions.js' terem sido carregados primeiro.

// Os event listeners das abas permanecem os mesmos
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.dataset.tab + '-tab';
        showTab(tabId);
    });
});

// MODIFICAÇÃO: Todas as funções que salvam dados agora são 'async' para usar o 'await'
addItemBtn.addEventListener('click', async () => {
    const url = itemUrlInput.value.trim();
    const tags = itemTagsInput.value.trim().split(',').map(tag => tag.trim()).filter(tag => tag);
    if (url) {
        const isDuplicate = items.some(item => item.url === url);
        if (isDuplicate) {
            showCustomModal(window.translations[currentLanguage]['folderAlreadyExists'](url), window.translations[currentLanguage]['okBtn']);
            return;
        }

        const metadata = await fetchMetadata(url);
        const newItem = {
            id: Date.now(),
            url,
            type: itemTypeSelect.value,
            folder: itemFolderSelect.value,
            tags: tags.length > 0 ? tags : [],
            metadata,
            timestamp: Date.now(),
            rating: 0,
            priority: false,
            accessHistory: []
        };
        
        items.push(newItem);
        await dbManager.saveItem(newItem); // SUBSTITUIÇÃO: Salva o novo item no DB

        for (const tag of tags) {
            if (!savedTags.includes(tag)) {
                savedTags.push(tag);
                await dbManager.saveTag(tag); // SUBSTITUIÇÃO: Salva a nova tag no DB
            }
        }
        
        itemUrlInput.value = '';
        itemTagsInput.value = '';
        previewContainer.classList.add('hidden');
        
        updateSavedTagsList();
        renderItems();
        updateFolderSelects();
        updateDashboard();
    }
});

pasteLinkBtn.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        itemUrlInput.value = text;
        await updatePreview(text);
    } catch (err) {
        console.error('Paste failed:', err);
        showCustomModal(window.translations[currentLanguage]['pasteFailed'], window.translations[currentLanguage]['okBtn']);
    }
});

addFolderBtn.addEventListener('click', async () => {
    const folderName = newFolderInput.value.trim();
    if (folderName && !folders.some(f => f.name === folderName)) {
        const newFolder = {
            name: folderName,
            color: folderColorSelect.value,
            icon: folderIconSelect.value
        };
        folders.push(newFolder);
        await dbManager.saveFolder(newFolder); // SUBSTITUIÇÃO: Salva a nova pasta no DB

        updateFolderSelects();
        newFolderInput.value = '';
        renderItems();
        updateDashboard();
    } else if (folderName) {
        showCustomModal(window.translations[currentLanguage]['folderAlreadyExists'](folderName), window.translations[currentLanguage]['okBtn']);
    } else {
        showCustomModal(window.translations[currentLanguage]['folderNameEmpty'], window.translations[currentLanguage]['okBtn']);
    }
});

// Listeners de busca permanecem os mesmos
searchQueryInput.addEventListener('input', searchItems);
searchTagsInput.addEventListener('input', searchItems);
searchTypeSelect.addEventListener('change', searchItems);
searchFolderSelect.addEventListener('change', (e) => {
    selectedFolder = e.target.value === 'all' ? null : e.target.value;
    searchItems();
});
searchRatingSelect.addEventListener('change', searchItems);
searchPrioritySelect.addEventListener('change', searchItems);

itemsList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = parseInt(e.target.dataset.id);
        showConfirmModal(window.translations[currentLanguage]['confirmDeleteItem'], async () => {
            items = items.filter(item => item.id !== id);
            await dbManager.deleteItem(id); // SUBSTITUIÇÃO: Deleta o item do DB
            renderItems();
            updateFolderSelects();
            updateDashboard();
        }, null, window.translations[currentLanguage]['yesBtn'], window.translations[currentLanguage]['noBtn']);
    } else if (e.target.classList.contains('copy-btn')) {
        const url = e.target.dataset.url;
        navigator.clipboard.writeText(url).then(() => {
            showCustomModal(window.translations[currentLanguage]['urlCopied'], window.translations[currentLanguage]['okBtn']);
        }).catch(err => {
            fallbackCopyTextToClipboard(url);
        });
    } else if (e.target.classList.contains('edit-item-btn')) {
        const id = parseInt(e.target.dataset.id);
        currentEditingItem = items.find(item => item.id === id);
        if (currentEditingItem) {
            editItemUrlInput.value = currentEditingItem.url;
            editItemTagsInput.value = currentEditingItem.tags.join(', ');
            editItemTypeSelect.value = currentEditingItem.type;
            editItemFolderSelect.value = currentEditingItem.folder || '';
            editItemPriorityCheckbox.checked = currentEditingItem.priority || false;
            editItemRatingInputs.forEach(radio => {
                radio.checked = parseInt(radio.value) === currentEditingItem.rating;
            });
            editItemModal.classList.remove('hidden');
        }
    }
});

saveItemChangesBtn.addEventListener('click', async () => {
    if (currentEditingItem) {
        const newUrl = editItemUrlInput.value.trim();
        const newTags = editItemTagsInput.value.trim().split(',').map(tag => tag.trim()).filter(tag => tag);
        
        currentEditingItem.url = newUrl;
        currentEditingItem.tags = newTags;
        currentEditingItem.type = editItemTypeSelect.value;
        currentEditingItem.folder = editItemFolderSelect.value || null;
        currentEditingItem.priority = editItemPriorityCheckbox.checked;
        
        editItemRatingInputs.forEach(radio => {
            if (radio.checked) currentEditingItem.rating = parseInt(radio.value);
        });
        
        if (newUrl !== currentEditingItem.url) {
            currentEditingItem.metadata = await fetchMetadata(newUrl);
        }

        await dbManager.saveItem(currentEditingItem); // SUBSTITUIÇÃO: Salva o item atualizado no DB
        
        for (const tag of newTags) {
            if (!savedTags.includes(tag)) {
                savedTags.push(tag);
                await dbManager.saveTag(tag); // SUBSTITUIÇÃO: Salva novas tags
            }
        }

        renderItems();
        editItemModal.classList.add('hidden');
        currentEditingItem = null;
        updateSavedTagsList();
        updateFolderSelects();
        updateDashboard();
    }
});

settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
});

toggleThemeBtn.addEventListener('click', async () => {
    theme = theme === 'light' ? 'dark' : 'light';
    await dbManager.saveSetting('theme', theme); // SUBSTITUIÇÃO: Salva o tema no DB
    applyTheme();
});

toggleFoldersBtn.addEventListener('click', () => {
    foldersListContainer.classList.toggle('hidden');
    toggleFoldersBtn.textContent = foldersListContainer.classList.contains('hidden') 
      ? window.translations[currentLanguage]['expandFoldersBtn']
      : window.translations[currentLanguage]['collapseFoldersBtn'];
});

clearItemsBtn.addEventListener('click', () => {
    showConfirmModal(window.translations[currentLanguage]['confirmClearAllItems'], async () => {
        items = [];
        await dbManager.clearAllItems(); // SUBSTITUIÇÃO: Limpa todos os itens do DB
        renderItems();
        updateFolderSelects();
        updateDashboard();
    }, null, window.translations[currentLanguage]['yesBtn'], window.translations[currentLanguage]['noBtn']);
});

manageDataBtn.addEventListener('click', () => {
    manageDataModal.classList.remove('hidden');
});

exportDataOptionBtn.addEventListener('click', () => {
    const data = { items, folders, savedTags, theme, currentLanguage };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'link-organizer-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    manageDataModal.classList.add('hidden');
});

importFileModalInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                importedDataCache = JSON.parse(event.target.result);
                manageDataModal.classList.add('hidden');
                importSelectionModal.classList.remove('hidden');
            } catch (err) {
                showCustomModal(window.translations[currentLanguage]['invalidJsonFile'], 'OK');
            }
        };
        reader.readAsText(file);
    }
});

confirmImportSelectionBtn.addEventListener('click', async () => {
    showConfirmModal(window.translations[currentLanguage]['confirmImport'], async () => {
        showLoadingMessage(window.translations[currentLanguage]['importingData']);
        
        // MODIFICAÇÃO: A lógica de importação agora salva tudo no DB
        if (importItemsCheckbox.checked && importedDataCache.items) {
            items = [...items, ...importedDataCache.items.filter(newItem => !items.some(exItem => exItem.url === newItem.url))];
            await dbManager.saveAllItems(items);
        }
        if (importFoldersCheckbox.checked && importedDataCache.folders) {
            folders = [...folders, ...importedDataCache.folders.filter(newFolder => !folders.some(exFolder => exFolder.name === newFolder.name))];
            await dbManager.saveAllFolders(folders);
        }
        if (importTagsCheckbox.checked && importedDataCache.savedTags) {
            savedTags = [...new Set([...savedTags, ...importedDataCache.savedTags])];
            await dbManager.saveAllTags(savedTags);
        }
        if (importThemeCheckbox.checked && importedDataCache.theme) {
            theme = importedDataCache.theme;
            await dbManager.saveSetting('theme', theme);
        }
        if (importLanguageCheckbox.checked && importedDataCache.currentLanguage) {
            currentLanguage = importedDataCache.currentLanguage;
            await dbManager.saveSetting('language', currentLanguage);
        }
        
        importSelectionModal.classList.add('hidden');
        showLoadingMessage(window.translations[currentLanguage]['importSuccess'], 2000);
        
        // Recarrega e renderiza tudo
        applyTheme();
        updateFolderSelects();
        updateSavedTagsList();
        applyLanguage(currentLanguage);
    }, () => {
        showCustomModal(window.translations[currentLanguage]['importCanceled'], 'OK');
    });
});

languageSelect.addEventListener('change', async (e) => {
    currentLanguage = e.target.value;
    await dbManager.saveSetting('language', currentLanguage); // SUBSTITUIÇÃO: Salva o idioma no DB
    applyLanguage(currentLanguage);
});

addTagBtn.addEventListener('click', async () => {
    const newTag = newTagInput.value.trim();
    if (newTag && !savedTags.includes(newTag)) {
        savedTags.push(newTag);
        await dbManager.saveTag(newTag); // SUBSTITUIÇÃO: Salva a nova tag no DB
        newTagInput.value = '';
        updateSavedTagsList();
    } else {
        showCustomModal(window.translations[currentLanguage]['folderAlreadyExists'](newTag), 'OK');
    }
});

tagsList.addEventListener('click', (e) => {
    const tag = e.target.dataset.tag;
    if (e.target.classList.contains('edit-tag-btn')) {
        currentEditingTag = tag;
        editTagNameInput.value = tag;
        editTagModal.classList.remove('hidden');
    } else if (e.target.classList.contains('delete-tag-btn')) {
        showConfirmModal(window.translations[currentLanguage].confirmDeleteTag(tag), async () => {
            savedTags = savedTags.filter(t => t !== tag);
            items.forEach(item => {
                item.tags = item.tags.filter(t => t !== tag);
            });
            await dbManager.deleteTag(tag); // SUBSTITUIÇÃO: Deleta a tag do DB
            await dbManager.saveAllItems(items); // SUBSTITUIÇÃO: Atualiza os itens afetados
            updateSavedTagsList();
            renderItems();
        }, null, 'Sim', 'Não');
    }
});

saveTagChangesBtn.addEventListener('click', async () => {
    const oldTag = currentEditingTag;
    const newTag = editTagNameInput.value.trim();
    if (newTag && newTag !== oldTag) {
        savedTags = savedTags.map(t => t === oldTag ? newTag : t);
        items.forEach(item => {
            item.tags = item.tags.map(t => t === oldTag ? newTag : t);
        });
        await dbManager.deleteTag(oldTag);
        await dbManager.saveTag(newTag);
        await dbManager.saveAllItems(items);
        updateSavedTagsList();
        renderItems();
        editTagModal.classList.add('hidden');
    }
});

saveFolderChangesBtn.addEventListener('click', async () => {
    if (currentEditingFolder) {
        const oldFolderName = currentEditingFolder.name;
        const newFolderName = editFolderNameInput.value.trim();
        if (newFolderName && newFolderName !== oldFolderName) {
            items.forEach(item => {
                if (item.folder === oldFolderName) item.folder = newFolderName;
            });
            currentEditingFolder.name = newFolderName;
            currentEditingFolder.color = editFolderColorSelect.value;
            currentEditingFolder.icon = editFolderIconSelect.value;

            await dbManager.deleteFolder(oldFolderName);
            await dbManager.saveFolder(currentEditingFolder);
            await dbManager.saveAllItems(items);

            updateFolderSelects();
            searchItems();
            editFolderModal.classList.add('hidden');
        }
    }
});

deleteFolderFromModalBtn.addEventListener('click', (e) => {
    if (currentEditingFolder) {
        const folderName = currentEditingFolder.name;
        showConfirmModal(`Deseja mesmo deletar a pasta "${folderName}"?`, async () => {
            folders = folders.filter(f => f.name !== folderName);
            items.forEach(item => {
                if (item.folder === folderName) item.folder = null;
            });
            await dbManager.deleteFolder(folderName);
            await dbManager.saveAllItems(items);
            updateFolderSelects();
            searchItems();
            editFolderModal.classList.add('hidden');
        });
    }
});

document.querySelectorAll('.clear-input-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const targetInput = document.getElementById(e.target.dataset.targetInput);
        if (targetInput) {
            targetInput.value = '';
            if (targetInput.id === 'item-url') updatePreview('');
            if (targetInput.id.startsWith('search-')) searchItems();
        }
    });
});

// --- REESTRUTURAÇÃO GERAL DA INICIALIZAÇÃO DO APP ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("1. DOMContentLoaded: Iniciando aplicação com IndexedDB.");
    showLoadingMessage("Carregando dados...");

    // 1. Carrega todos os dados do banco de dados
    const loadedData = await dbManager.loadAllData();
    items = loadedData.items;
    folders = loadedData.folders;
    savedTags = loadedData.savedTags;
    theme = loadedData.settings.theme || 'light';
    currentLanguage = loadedData.settings.language || 'pt-BR';
    
    // 2. Lógica de primeira execução: se não houver pastas, adiciona as padrão
    if (folders.length === 0) {
        const defaultFolders = [
            { name: 'TikTok', color: 'bg-black', icon: 'svg/tiktok.svg' },
            { name: 'Kwai', color: 'bg-yellow-500', icon: 'svg/kwai.svg' },
            { name: 'Facebook', color: 'bg-blue-600', icon: 'svg/facebook.svg' },
            { name: 'Instagram', color: 'bg-pink-600', icon: 'svg/instagram.svg' },
            { name: 'YouTube', color: 'bg-red-600', icon: 'svg/youtube.svg' },
            { name: 'Dailymotion', color: 'bg-teal-600', icon: 'svg/dailymotion.svg' },
            { name: 'Outros Links', color: 'bg-gray-500', icon: 'svg/link.svg' }
        ];
        folders = defaultFolders;
        await dbManager.saveAllFolders(defaultFolders);
    }
    
    // 3. Renderiza a UI com os dados carregados
    languageSelect.value = currentLanguage;
    applyTheme();
    updateFolderSelects();
    updateSavedTagsList();
    applyLanguage(currentLanguage); // Chama de novo para garantir todas as traduções
    showTab('dashboard-tab');
    
    // 4. Atribuição de event listeners (após tudo estar pronto)
    const checkUpdateBtn = document.getElementById('check-update-btn');
    if (checkUpdateBtn) checkUpdateBtn.addEventListener('click', checkForUpdates);
    
    const viewQueueBtn = document.getElementById('view-queue-btn');
    if(viewQueueBtn) {
        viewQueueBtn.addEventListener('click', () => {
            showTab('folders-items-tab');
            searchTagsInput.value = '#fila';
            searchItems();
        });
    }

    if(toggleNotificationsBtn) {
        toggleNotificationsBtn.addEventListener('click', handleNotifications);
    }
    
    // Event listeners de scroll
    window.addEventListener('scroll', () => {
        backToTopBtn.classList.toggle('hidden', window.scrollY <= 200);
        goToBottomBtn.classList.toggle('hidden', (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200);
    });
    backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    goToBottomBtn.addEventListener('click', () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
    
    hideLoadingMessage();
    console.log("Aplicação pronta!");
});