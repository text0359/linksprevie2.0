// **Variáveis de Estado Globais:**
// As variáveis agora são inicializadas vazias ou com seus valores padrão.
// Elas serão preenchidas de forma assíncrona a partir do IndexedDB no arquivo main.js.

let items = [];
let folders = [];
let savedTags = [];
let theme = 'light';
let currentLanguage = 'pt-BR';

// O objeto de mapeamento de cores permanece o mesmo.
const FOLDER_COLOR_MAP = {
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#22c55e',
    'bg-red-500': '#ef4444',
    'bg-purple-500': '#a855f7',
    'bg-yellow-500': '#eab308',
    'bg-black': '#000000',
    'bg-teal-600': '#0d9488',
    'bg-pink-600': '#db2777',
    'bg-gray-500': '#6b7280'
};

let selectedFolder = null;
let currentEditingTag = null;
let currentEditingItem = null;
let currentEditingFolder = null;
let importedDataCache = null;

// **Referências a Elementos do DOM (Document Object Model):**
// As referências permanecem as mesmas, com a adição dos novos elementos.

const backToTopBtn = document.getElementById('back-to-top-btn');
const goToBottomBtn = document.getElementById('go-to-bottom-btn');

// Seção de Adicionar Novo Item
const itemUrlInput = document.getElementById('item-url');
const itemTagsInput = document.getElementById('item-tags');
const itemTypeSelect = document.getElementById('item-type');
const itemFolderSelect = document.getElementById('item-folder');
const addItemBtn = document.getElementById('add-item-btn');
const pasteLinkBtn = document.getElementById('paste-link-btn');
const previewContainer = document.getElementById('preview-container');
const previewImage = document.getElementById('preview-image');
const previewTitle = document.getElementById('preview-title');
const previewDescription = document.getElementById('preview-description');

// Seção de Criar Nova Pasta
const newFolderInput = document.getElementById('new-folder');
const folderColorSelect = document.getElementById('folder-color');
const folderIconSelect = document.getElementById('folder-icon');
const addFolderBtn = document.getElementById('add-folder-btn');

// Seção de Busca de Itens
const searchQueryInput = document.getElementById('search-query');
const searchTagsInput = document.getElementById('search-tags-input');
const searchTypeSelect = document.getElementById('search-type');
const searchFolderSelect = document.getElementById('search-folder');
const searchRatingSelect = document.getElementById('search-rating');
const searchPrioritySelect = document.getElementById('search-priority');

// Listas e Paineis Globais
const foldersList = document.getElementById('folders-list');
const foldersListContainer = document.getElementById('folders-list-container');
const toggleFoldersBtn = document.getElementById('toggle-folders-btn');
const allItemsBtn = document.getElementById('all-items-btn');
const itemsList = document.getElementById('items-list');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const toggleThemeBtn = document.getElementById('toggle-theme-btn');
const clearItemsBtn = document.getElementById('clear-items-btn');
const manageDataBtn = document.getElementById('manage-data-btn');
const languageSelect = document.getElementById('language-select');
const toggleNotificationsBtn = document.getElementById('toggle-notifications-btn');

// Elementos do Gerenciamento de Tags (no Painel de Configurações)
const newTagInput = document.getElementById('new-tag-input');
const addTagBtn = document.getElementById('add-tag-btn');
const tagsList = document.getElementById('tags-list');
const savedTagsDatalist = document.getElementById('saved-tags-datalist');
const savedTagsDatalistSearch = document.getElementById('saved-tags-datalist-search');

// Elementos dos Modais de Edição
const editFolderModal = document.getElementById('edit-folder-modal');
const editFolderNameInput = document.getElementById('edit-folder-name');
const editFolderColorSelect = document.getElementById('edit-folder-color');
const editFolderIconSelect = document.getElementById('edit-folder-icon');
const saveFolderChangesBtn = document.getElementById('save-folder-changes-btn');
const deleteFolderFromModalBtn = document.getElementById('delete-folder-from-modal-btn');

const editItemModal = document.getElementById('edit-item-modal');
const editItemUrlInput = document.getElementById('edit-item-url');
const editItemTagsInput = document.getElementById('edit-item-tags');
const editItemTypeSelect = document.getElementById('edit-item-type');
const editItemFolderSelect = document.getElementById('edit-item-folder');
const editItemRatingInputs = document.querySelectorAll('#edit-item-rating input[name="rating-edit"]');
const editItemPriorityCheckbox = document.getElementById('edit-item-priority');
const saveItemChangesBtn = document.getElementById('save-item-changes-btn');

const editTagModal = document.getElementById('edit-tag-modal');
const editTagNameInput = document.getElementById('edit-tag-name');
const saveTagChangesBtn = document.getElementById('save-tag-changes-btn');

// Elementos do Modal de Gerenciamento de Dados
const manageDataModal = document.getElementById('manage-data-modal');
const exportDataOptionBtn = document.getElementById('export-data-option-btn');
const importFileModalInput = document.getElementById('import-file-modal-input');
const loadingMessage = document.getElementById('loading-message');

// Elementos do Modal de Seleção de Opções de Importação
const importSelectionModal = document.getElementById('import-selection-modal');
const importItemsCheckbox = document.getElementById('import-items-checkbox');
const importFoldersCheckbox = document.getElementById('import-folders-checkbox');
const importTagsCheckbox = document.getElementById('import-tags-checkbox');
const importThemeCheckbox = document.getElementById('import-theme-checkbox');
const importLanguageCheckbox = document.getElementById('import-language-checkbox');
const confirmImportSelectionBtn = document.getElementById('confirm-import-selection-btn');

// Elementos do Sistema de Abas
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Elementos específicos do Dashboard
const dashboardTotalItems = document.getElementById('dashboard-total-items');
const dashboardItemsByType = document.getElementById('dashboard-items-by-type');
const dashboardTotalFolders = document.getElementById('dashboard-total-folders');
const dashboardItemsByFolder = document.getElementById('dashboard-items-by-folder');
const dashboardTotalTags = document.getElementById('dashboard-total-tags');
const dashboardTopTags = document.getElementById('dashboard-top-tags');
const dashboardItemsByRating = document.getElementById('dashboard-items-by-rating');
const dashboardCurrentTheme = document.getElementById('dashboard-current-theme');
const dashboardCurrentLanguage = document.getElementById('dashboard-current-language');
const dashboardLastAccessedItems = document.getElementById('dashboard-last-accessed-items');
const dashboardMostAccessedVideos = document.getElementById('dashboard-most-accessed-videos');
const rediscoverItemContent = document.getElementById('rediscover-item-content');

// Elementos do Reprodutor de Vídeo
const videoPlayerModal = document.getElementById('video-player-modal');
const videoPlayerIframeContainer = document.getElementById('video-player-iframe-container');

const CURRENT_APP_VERSION = "1.0.0";

// **Objeto de Traduções:**
// Permanece o mesmo, com as chaves que já adicionamos.
window.translations = {
  'pt-BR': {
    appTitle: 'Links Preview Organizer2.0',
    settingsBtn: 'Configurações',
    exportBtn: 'Exportar',
    manageDataBtn: 'Gerenciar Dados',
    settingsTitle: 'Configurações',
    toggleDarkThemeBtn: 'Alternar Tema Escuro',
    clearAllItemsBtn: 'Limpar Todos os Itens',
    checkUpdateBtn: 'Verificar Atualizações',
    updateAvailable: (version) => `Nova versão disponível: v${version}`,
    updateNoAvailable: 'Seu aplicativo está atualizado!',
    updateChangelog: 'Notas da versão:',
    updateDownloadPrompt: 'Deseja baixar agora?',
    updateDownload: 'Baixar',
    updateChecking: 'Verificando atualizações...',
    importBtn: 'Importar',
    selectImportOptions: 'Selecionar Opções de Importação',
    foldersCheckbox: 'Pastas',
    itemsCheckbox: 'Itens',
    tagsCheckbox: 'Tags',
    themeCheckbox: 'Tema',
    languageCheckbox: 'Idioma',
    confirmImportBtn: 'Confirmar Importação',
    languageLabel: 'Idioma:',
    addNewItemTitle: 'Adicionar Novo Item',
    itemUrlPlaceholder: 'Inserir ou colar URL (ex: vídeo, foto, site)',
    itemTagsPlaceholder: 'Tags (ex: inspiração, trabalho, separadas por vírgulas)',
    pasteLinkBtn: 'Colar Link',
    optionLink: 'Link',
    optionVideo: 'Vídeo',
    optionPhoto: 'Foto',
    addItemBtn: 'Adicionar Item',
    createNewFolderTitle: 'Criar Nova Pasta',
    newFolderNamePlaceholder: 'Nome da nova pasta',
    colorBlue: 'Azul',
    colorGreen: 'Verde',
    colorRed: 'Vermelho',
    colorPurple: 'Roxo',
    colorYellow: 'Amarelo',
    colorBlack: 'Preto',
    colorTeal: 'Ciano',
    colorPink: 'Rosa',
    iconTikTok: 'TikTok',
    iconKwai: 'Kwai',
    iconFacebook: 'Facebook',
    iconInstagram: 'Instagram',
    iconYouTube: 'YouTube',
    iconDailymotion: 'Dailymotion',
    iconFolder: 'Pasta',
    iconLink: 'Outro Link',
    addFolderBtn: 'Adicionar Pasta',
    foldersTitle: 'Pastas',
    allItemsBtn: 'Todos os Itens',
    searchItemsTitle: 'Buscar Itens',
    searchQueryPlaceholder: 'Buscar por URL ou título/descrição...',
    searchTagsPlaceholder: 'Buscar por tags (separadas por vírgulas)...',
    allTypes: 'Todos os Tipos',
    allFolders: 'Todas as Pastas',
    allRatings: 'Todas as Avaliações',
    savedItemsTitle: 'Itens Salvos',
    editFolderTitle: 'Editar Pasta',
    folderNameLabel: 'Nome da Pasta:',
    folderColorLabel: 'Cor da Pasta:',
    folderIconLabel: 'Ícone da Pasta:',
    saveChangesBtn: 'Salvar Alterações',
    deleteFolderBtn: 'Excluir Pasta',
    cancelBtn: 'Cancelar',
    editItemTitle: 'Editar Elemento',
    urlLabel: 'URL:',
    tagsLabel: 'Tags (separadas por vírgula):',
    typeLabel: 'Tipo:',
    folderLabel: 'Pasta:',
    ratingLabel: 'Avaliação:',
    copyBtn: 'Copiar',
    editBtn: 'Editar',
    deleteBtn: 'Excluir',
    rateBtn: 'Avaliar',
    noItemsFound: 'Nenhum item encontrado.',
    itemType: 'Tipo',
    itemFolder: 'Pasta',
    noFolder: 'N/A',
    youtubeVideoPrefix: 'Vídeo do YouTube',
    youtubeVideoDescription: 'Assista a este vídeo no YouTube.',
    dailymotionVideoPrefix: 'Vídeo do Dailymotion',
    dailymotionVideoDescription: 'Assista a este vídeo no Dailymotion.',
    instagramLinkPrefix: 'Link do Instagram',
    instagramLinkDescription: 'Ver este conteúdo no Instagram.',
    tiktokVideoPrefix: 'Vídeo do TikTok',
    tiktokVideoDescription: 'Veja este vídeo no TikTok.',
    kwaiVideoPrefix: 'Vídeo do Kwai',
    kwaiVideoDescription: 'Veja este vídeo no Kwai.',
    facebookLinkPrefix: 'Link do Facebook',
    facebookLinkDescription: 'Veja este conteúdo no Facebook.',
    genericLinkPrefix: 'Link',
    genericContentFrom: 'Conteúdo de',
    noMetadataAvailable: 'Nenhum metadado disponível',
    noPreview: 'Sem Pré-visualização',
    loadingPreview: 'Carregando pré-visualização...',
    fetchingPreview: 'Buscando pré-visualização...',
    invalidUrl: 'Link Inválido',
    enterValidUrl: 'Por favor, insira uma URL válida.',
    pasteFailed: 'Falha ao colar: O navegador pode ter impedido o acesso à área de transferência.',
    urlCopied: 'URL copiada para a área de transferência!',
    copyFailed: 'Falha ao copiar: Por favor, tente copiar manualmente.',
    confirmDeleteItem: 'Tem certeza de que deseja excluir este item?',
    confirmClearAllItems: 'Tem certeza de que deseja limpar todos os itens?',
    confirmImport: 'Confirmar importação? Isso pode substituir dados existentes. Você pode escolher quais dados importar.',
    folderAlreadyExists: (name) => `A pasta "${name}" já existe.`,
    folderNameEmpty: 'Por favor, insira um nome para a pasta.',
    confirmDeleteFolder: (name, linksCount) => {
        if (linksCount > 0) {
            return `Tem certeza de que deseja excluir a pasta "${name}"? Todos os ${linksCount} links dentro dela serão movidos para "All Items".`;
        } else {
            return `Tem certeza de que deseja excluir a pasta "${name}"? Não há links nesta pasta.`;
        }
    },
    invalidJsonFile: 'Arquivo JSON inválido.',
    yesBtn: 'Sim',
    noBtn: 'Não',
    okBtn: 'OK',
    manageTagsTitle: 'Gerenciar Tags',
    newTagPlaceholder: 'Nome da nova tag',
    addTagBtn: 'Adicionar Tag',
    editTagTitle: 'Editar Tag',
    tagNameLabel: 'Nome da Tag:',
    confirmDeleteTag: (tag) => `Tem certeza de que deseja excluir a tag "${tag}"? Ela será removida de todos os itens.`,
    itemsInFolder: 'itens',
    dashboardTab: 'Dashboard',
    createSaveTab: 'Criar/Salvar Links',
    foldersItemsTab: 'Pastas & Itens Salvos',
    dashboardTitle: 'Dashboard',
    dashboardContent: 'Bem-vindo ao seu painel! Aqui você encontrará um resumo de seus dados.',
    totalItems: 'Total de Itens',
    itemsByType: 'Itens por Tipo',
    totalFolders: 'Total de Pastas',
    itemsByFolder: 'Itens por Pasta',
    totalTags: 'Total de Tags',
    topTags: 'Tags Mais Usadas',
    itemsByRating: 'Itens por Avaliação',
    systemInfo: 'Informações do Sistema',
    currentTheme: 'Tema Atual:',
    currentLanguage: 'Idioma Atual:',
    linkType: 'Link',
    videoType: 'Vídeo',
    photoType: 'Foto',
    noRating: 'Não Avaliado',
    star: 'Estrela',
    stars: 'Estrelas',
    noFolderAssigned: 'Não atribuído',
    dataPlaceholder: 'Nenhum dado',
    lastAccessedItemsTitle: 'Últimos Acessos (Vídeos)',
    accessedOn: 'Acessado em',
    mostAccessedItemsTitle: 'Vídeos Mais Acessados',
    copyIdBtn: 'Copiar ID',
    videoPlayerTitle: 'Reprodutor de Vídeo',
    collapseFoldersBtn: 'Recolher Pastas',
    expandFoldersBtn: 'Expandir Pastas',
    importingData: 'Importando dados...',
    importSuccess: 'Dados importados com sucesso!',
    importCanceled: 'Importação cancelada.',
    aboutUsLink: 'Sobre Nós',
    privacyPolicyLink: 'Política de Privacidade',
    termsOfServiceLink: 'Termos de Serviço',
    contactUsLink: 'Contato',
    copyright: (year) => `© ${year} Links Preview Organizer2.0. Todos os direitos reservados. Criado por Werveson Nean.`,
    toggleNotificationsBtn: 'Ativar Lembretes',
    notificationsEnabled: 'Lembretes ativados!',
    notificationsDisabled: 'Lembretes desativados.',
    notificationsBlocked: 'As notificações estão bloqueadas. Por favor, habilite-as nas configurações do seu navegador.',
    rediscoverTitle: 'Redescubra este Link',
    noItemsToRediscover: 'Nenhum item para redescobrir ainda!',
    viewQueueBtn: 'Ver Fila (#fila)',
    allPriorities: 'Todas as Prioridades',
    highPriority: 'Alta Prioridade',
    normalPriority: 'Prioridade Normal',
    highPriorityLabel: 'Marcar como Alta Prioridade'
  },
  // ... As outras linguagens (en, es) permanecem as mesmas que já definimos antes
};