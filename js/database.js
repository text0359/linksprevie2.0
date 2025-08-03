// js/database.js

// NOTA: Este arquivo depende da biblioteca Dexie.js,
// que será adicionada ao index.html no próximo passo.

// 1. Definição do Banco de Dados
const db = new Dexie('linkOrganizerDB');

// 2. Definição do Schema (Estrutura das "Tabelas")
// Version 1: Define as tabelas e seus índices para busca.
// 'id' é a chave primária para items.
// '&name' significa que o nome da pasta/tag é único.
// 'key' é a chave primária para as configurações.
// '*tags' indica que 'tags' é um array e cada valor nele será indexado.
db.version(1).stores({
    items: 'id, folder, priority, *tags',
    folders: '&name',
    tags: '&name',
    settings: 'key' // 'key' será 'theme', 'language', etc.
});

// 3. Objeto Gerenciador (Wrapper) com as Funções de Acesso
const dbManager = {
    /**
     * Carrega todos os dados do banco de dados de uma só vez.
     * @returns {Promise<Object>} Um objeto com todos os items, folders, tags e configurações.
     */
    async loadAllData() {
        try {
            const [items, folders, tags, settingsArray] = await Promise.all([
                db.items.toArray(),
                db.folders.toArray(),
                db.tags.toArray(),
                db.settings.toArray()
            ]);

            // Converte o array de configurações em um objeto simples (ex: { theme: 'light' })
            const settings = settingsArray.reduce((acc, setting) => {
                acc[setting.key] = setting.value;
                return acc;
            }, {});

            // Extrai apenas o nome das tags para um array de strings
            const savedTags = tags.map(tag => tag.name);

            return { items, folders, savedTags, settings };
        } catch (error) {
            console.error("Falha ao carregar dados do IndexedDB:", error);
            // Retorna um estado padrão em caso de erro
            return { items: [], folders: [], savedTags: [], settings: {} };
        }
    },

    // --- Funções para 'items' ---
    async saveItem(item) {
        return db.items.put(item);
    },
    async deleteItem(itemId) {
        return db.items.delete(itemId);
    },
    async saveAllItems(itemsArray) {
        return db.items.bulkPut(itemsArray);
    },
    async clearAllItems() {
        return db.items.clear();
    },

    // --- Funções para 'folders' ---
    async saveFolder(folder) {
        return db.folders.put(folder);
    },
    async deleteFolder(folderName) {
        return db.folders.delete(folderName);
    },
    async saveAllFolders(foldersArray) {
        return db.folders.bulkPut(foldersArray);
    },

    // --- Funções para 'tags' ---
    async saveTag(tagName) {
        return db.tags.put({ name: tagName });
    },
    async deleteTag(tagName) {
        return db.tags.delete(tagName);
    },
    async saveAllTags(tagsArray) {
        const tagObjects = tagsArray.map(name => ({ name }));
        return db.tags.bulkPut(tagObjects);
    },

    // --- Funções para 'settings' ---
    async saveSetting(key, value) {
        return db.settings.put({ key, value });
    }
};