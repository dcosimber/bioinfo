document.addEventListener("DOMContentLoaded", function() {
    let headers = document.querySelectorAll('.md-content h1, .md-content h2, .md-content h3');
    let currentChapter = 0, currentSection = 0, currentSubsection = 0;
  
    headers.forEach(header => {
      if (header.tagName === 'H1') {
        currentChapter++;
        currentSection = 0;
        header.innerText = currentChapter + '. ' + header.innerText;
      } else if (header.tagName === 'H2') {
        currentSection++;
        currentSubsection = 0;
        header.innerText = currentChapter + '.' + currentSection + ' ' + header.innerText;
      } else if (header.tagName === 'H3') {
        currentSubsection++;
        header.innerText = currentChapter + '.' + currentSection + '.' + currentSubsection + ' ' + header.innerText;
      }
    });
  });
  