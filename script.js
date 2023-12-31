  // Constantes e Variaveis
  const mainList = document.querySelector('#projects-main-list');
  const filterOptions = document.querySelector('#filter-options');
  const filterButton = document.querySelector('.filter-button');
  const prevPageButton = document.querySelector('#prevPage');
  const nextPageButton = document.querySelector('#nextPage');
  const reloadQueryButton = document.querySelector('#reload');
  const projectsPerPage = 10; // Projetos por página
  const tipyingCategory = ['ghostwriting', 'ebooks', 'pdf', 'articles', 'fiction', 'reviews', 'article_submission', 'content-writing', 'research', 'research_writing'];
  const virtualAssistantCategory = ['data_processing', 'data_entry', 'excel', 'video_upload', 'transcription', 'web_search', 'technical_support', 'phone_support', 'desktop_support', 'email_handling'];
  const socialMediaCategory = ['website_design', 'logo_design', 'flash', 'banner_design', 'photoshop', 'industrial_design', 'rendering', 'typography', 'animation'];
  const allCategoriesList = [...tipyingCategory, ...virtualAssistantCategory, ...socialMediaCategory];
  let currentPage = 1; // Página atual
  let projects = []; // Array para armazenar todos os projetos
  let initialProjectsList = JSON.parse(localStorage.getItem('complete_initial_list')) || [];

  // Event Listeners
  reloadQueryButton.addEventListener('click', handleReload);
  filterButton.addEventListener('click', handleFilter);
  prevPageButton.addEventListener('click', handlePrevPage);
  nextPageButton.addEventListener('click', handleNextPage);

  // Functions

  async function getAll(initialList) {
  const savedProjects = localStorage.getItem('saved_freelancer_projects');
  
  if (savedProjects !== null) {
    console.log('Coletando dados do armazenamento local.');
    return JSON.parse(savedProjects);
  } else {
    console.log('Realizando requisições para a API.');
    const data = [];

    // Função auxiliar para fazer uma única requisição e adicionar à lista de dados
    async function fetchData(offset) {
      const response = await fetch(`https://www.freelancer.com/api/projects/0.1/projects/all?offset=${offset}`);
      const data = await response.json();
      initialList.push(data.result.projects);
    }

    // Array de offsets para as requisições
    const offsets = [0, 100, 200, 300, 400, 500, 600];

    // Fazer as requisições em paralelo usando Promise.all
    await Promise.all(offsets.map(offset => fetchData(offset)));

    localStorage.setItem('saved_freelancer_projects', JSON.stringify(initialList));
    console.log('Requisições completas. Lista inicial criada.');
    return initialList;
  }
}

  async function fetchProjects(page, category = 'all') {
    let all = await getAll(projects);
      localStorage.setItem('saved_freelancer_projects', JSON.stringify(all));

          const completeList = [];
          
          if(localStorage.getItem('filtered_list') !== null) {
            all = JSON.parse(localStorage.getItem('complete_initial_list'));
          }
          
          localStorage.setItem('saved_freelancer_projects', JSON.stringify(all));
          localStorage.setItem('complete_initial_list', JSON.stringify(all));
          const filteredProjects = all.map((item) => {
            return item.filter((subItem) =>{
              if (category === 'all') {
                return allCategoriesList.some((word) => subItem.seo_url.match(new RegExp(`^(${word})/`, 'i')));
              } else if (category === 'typing_professional') {
                return tipyingCategory.some((word) => subItem.seo_url.match(new RegExp(`^(${word})/`, 'i')));
              } else if (category === 'virtual_assistant') {
                return virtualAssistantCategory.some((word) => subItem.seo_url.match(new RegExp(`^(${word})/`, 'i')));
              } else if (category === 'social_media_professional') {
                return socialMediaCategory.some((word) => subItem.seo_url.match(new RegExp(`^(${word})/`, 'i')));
              }
              return allCategoriesList.some((word) => subItem.seo_url.match(new RegExp(`^(${word})/`, 'i')));

            });
          });

          if (category === 'all') {
            localStorage.removeItem('filtered_list');
          } else {
            localStorage.setItem('filtered_list', JSON.stringify(filteredProjects));
          }

          if (localStorage.getItem('complete_initial_list') === null) {
            initialProjectsList = initialProjectsList.map((item) => {
              return item.filter((subItem) => {
                return allCategoriesList.some((word) => subItem.seo_url.match(new RegExp(`^(${word})/`, 'i')));
              });
            });
            initialProjectsList.forEach((item) => {
              item.forEach((subItem) => {
                completeInitialList.push(subItem);
              });
            });
            
            localStorage.setItem('complete_initial_list', JSON.stringify(completeInitialList));
          }

          filteredProjects.forEach((item) => {
            item.forEach((subItem) => {
              completeList.push(subItem);
            });
          });


          projects = completeList;
          // Calcular o índice inicial e final dos projetos a serem exibidos
          const startIndex = (page - 1) * projectsPerPage;
          const endIndex = startIndex + projectsPerPage;

          // Filtrar os projetos para a página atual
          const projectsToDisplay = projects.slice(startIndex, endIndex);

          // Limpar a lista antes de adicionar novos projetos
          mainList.innerHTML = '';
          projectsToDisplay.forEach((item) => {
            const article = document.createElement('article');
            article.className = 'api-result-list';

            const contentContainer = document.createElement('div');
            contentContainer.className = 'content-container';
            const submitDate = new Date(item.submitdate * 1000);
            contentContainer.innerHTML = `
              <h6>${item.title}</h6>
              <p class="category-name">${getCategoryName(item.seo_url)}</p>
              <p class='submit-date'>Posted ${formatDateTime(submitDate)}</p>
              <p>${item.preview_description}...</p>
            `;

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';
            const button = document.createElement('button');
            button.innerHTML = `<a href="https://www.freelancer.com/projects/${item.seo_url}" target="_blank">Apply Now »</a>`;
            buttonContainer.appendChild(button);

            article.appendChild(contentContainer);
            article.appendChild(buttonContainer);

            mainList.appendChild(article);
          });
          // Atualizar os botões de página
          updatePaginationButtons(projects);
  }

  function updatePaginationButtons(referenceList) {
    const totalPages = Math.ceil(referenceList.length / projectsPerPage);
      console.log('Numero de paginas no filtro atual:', totalPages);

      prevPageButton.disabled = currentPage === 1;
      nextPageButton.disabled = currentPage === totalPages;
  }

  function getCategoryName(seoUrl) {
    if (tipyingCategory.some((word) => seoUrl.match(new RegExp(`^(${word})/`, 'i')))) {
        return 'Typing Professional';
      } else if (virtualAssistantCategory.some((word) => seoUrl.match(new RegExp(`^(${word})/`, 'i')))) {
        return 'Virtual Assistant';
      } else if (socialMediaCategory.some((word) => seoUrl.match(new RegExp(`^(${word})/`, 'i')))) {
        return 'Social Media Professional';
      }
      return 'Nao foi encontrada categoria';
  }

  function handleReload(e) {
    e.preventDefault();
    localStorage.removeItem('filtered_list');
    localStorage.removeItem('saved_freelancer_projects');
    fetchProjects(currentPage, filterOptions.value);
    window.location.reload();
  }

  function handleFilter(e) {
    e.preventDefault();
    currentPage = 1; // Reset da página para a primeira
    fetchProjects(currentPage, filterOptions.value);
  }

  function handlePrevPage() {
    if (currentPage > 1) {
      currentPage--;
      fetchProjects(currentPage, filterOptions.value);
    }
  }

  function handleNextPage() {
    const totalPages = Math.ceil(projects.length / projectsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      fetchProjects(currentPage, filterOptions.value);
    }
  }

  function formatDateTime(data) {
    const day = String(data.getDate()).padStart(2, '0');
    const month = String(data.getMonth() + 1).padStart(2, '0'); // O mês é base 0, então somamos 1
    const year = data.getFullYear();
    const hours = String(data.getHours()).padStart(2, '0');
    const minutes = String(data.getMinutes()).padStart(2, '0');
    const seconds = String(data.getSeconds()).padStart(2, '0');
  
    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
  }

  // Initial Fetch
  fetchProjects(currentPage);
