// Object containing slug objects of pages
const pageData = {
  'Wat maken': {
    parent: ''
  },
  'Wat kiezen': {
    parent: ''
  },
  'Wat worden': {
    parent: ''
  },
  'Alle vakken': {
    parent: ''
  },
  'Kernvakken': {
    parent: ''
  },
  'Profileringen': {
    parent: ''
  },
  'Minoren': {
    parent: ''
  },
  'Stages': {
    parent: ''
  },
  'CMD Aan': {
    parent: 'Kernvakken'
  },
  'Project 1': {
    parent: 'Kernvakken'
  },
  'Internetstandaarden': {
    parent: 'Kernvakken'
  },
  'HCI': {
    parent: 'Kernvakken'
  },
  'Ontwerpgeschiedenis': {
    parent: 'Kernvakken'
  },
  'Project 2': {
    parent: 'Kernvakken'
  },
  'Text in context': {
    parent: 'Kernvakken'
  },
  'Vormgeving': {
    parent: 'Kernvakken'
  },
  'User Centred Design': {
    parent: 'Kernvakken'
  },
  'Project 3': {
    parent: 'Kernvakken'
  },
  'Inleiding programmeren': {
    parent: 'Kernvakken'
  },
  'Visual Interface Design': {
    parent: 'Kernvakken'
  },
  'New Product Development': {
    parent: 'Kernvakken'
  },
  'Project 4': {
    parent: 'Kernvakken'
  },
  'Plug and Play': {
    parent: 'Kernvakken'
  },
  'Informatie Architectuur': {
    parent: 'Kernvakken'
  },
  'Maatschappij en Interactie': {
    parent: 'Kernvakken'
  },
  'Project Web': {
    parent: 'Kernvakken'
  },
  'Frontend Development': {
    parent: 'Kernvakken'
  },
  'Vormgeving 2': {
    parent: 'Kernvakken'
  },
  'Design Patterns': {
    parent: 'Kernvakken'
  },
  'Project Beyond': {
    parent: 'Kernvakken'
  },
  'Ubicomp': {
    parent: 'Kernvakken'
  },
  'Content Delivery': {
    parent: 'Kernvakken'
  },
  'Ontwerponderzoek': {
    parent: 'Kernvakken'
  },
  'Studieregiepunt': {
    parent: 'Kernvakken'
  },
  'Studieloopbaancoaching': {
    parent: 'Kernvakken'
  },
  'Visual Interface Designer': {
    parent: 'Profileringen'
  },
  'Interaction Designer': {
    parent: 'Profileringen'
  },
  'Frontend Developer': {
    parent: 'Profileringen'
  },
  'Content Manager': {
    parent: 'Profileringen'
  },
  'Project Tech': {
    parent: 'Profileringen'
  },
  'Backend Development': {
    parent: 'Profileringen'
  },
  'Frontend Development 2': {
    parent: 'Profileringen'
  },
  'Project Visual': {
    parent: 'Profileringen'
  },
  'Visual Interface Design 2': {
    parent: 'Profileringen'
  },
  'Visual Research': {
    parent: 'Profileringen'
  },
  'Project Interaction': {
    parent: 'Profileringen'
  },
  'Evidence Based Design': {
    parent: 'Profileringen'
  },
  'Behavioral Patterns': {
    parent: 'Profileringen'
  },
  'Project International': {
    parent: 'Profileringen'
  },
  'Culture Mapping': {
    parent: 'Profileringen'
  },
  'Design Through Empathy': {
    parent: 'Profileringen'
  },
  'Keuze uit profileringsvakken': {
    parent: 'Profileringen'
  },
  'Audio Visual Design': {
    parent: 'Profileringen'
  },
  'Online Marketing': {
    parent: 'Profileringen'
  },
  'Mediatheorie': {
    parent: 'Profileringen'
  },
  'Storytelling': {
    parent: 'Profileringen'
  },
  'Project Persuasion': {
    parent: 'Profileringen'
  },
  'Content Creatie': {
    parent: 'Profileringen'
  },
  'Designing with Purpose': {
    parent: 'Profileringen'
  },
  'Design Ethics': {
    parent: 'Profileringen'
  },
  'Project Design for Business': {
    parent: 'Profileringen'
  },
  'Business Strategy': {
    parent: 'Profileringen'
  },
  'Service Design': {
    parent: 'Profileringen'
  },
  'Adaptive Content': {
    parent: 'Profileringen'
  },
  'Project Datavisualisatie': {
    parent: 'Profileringen'
  },
  'Information Design': {
    parent: 'Profileringen'
  },
  'Frontend 3 Data': {
    parent: 'Profileringen'
  },
  'Data Experience': {
    parent: 'Profileringen'
  },
  'Project Design Behind the Scenes': {
    parent: 'Profileringen'
  },
  'Design Improvement by Testing': {
    parent: 'Profileringen'
  },
  'The Design of Business': {
    parent: 'Profileringen'
  },
  'Tools for Design Improvement': {
    parent: 'Profileringen'
  },
  'Project Informotion': {
    parent: 'Profileringen'
  },
  'Explanation Design': {
    parent: 'Profileringen'
  },
  'Storytelling with Data': {
    parent: 'Profileringen'
  },
  'Motion Design': {
    parent: 'Profileringen'
  },
  'Project eHealth': {
    parent: 'Profileringen'
  },
  'eHealth Ontwerpen': {
    parent: 'Profileringen'
  },
  'eHealth Onderzoeken': {
    parent: 'Profileringen'
  },
  'eHealth Maken': {
    parent: 'Profileringen'
  },
  'Minor Vormgeving': {
    parent: 'Minoren'
  },
  'Minor Web Development': {
    parent: 'Minoren'
  },
  'English Minor User Experience Design': {
    parent: 'Minoren'
  },
  'English Minor Design Thinking and Doing': {
    parent: 'Minoren'
  },
  'Minor Applied Game Design': {
    parent: 'Minoren'
  },
  'Andere Minoren': {
    parent: 'Minoren'
  },
  'Korte Stage': {
    parent: 'Stages'
  },
  'Afstudeerstage': {
    parent: 'Stages'
  },
  'Afstudeerproject': {
    parent: 'Stages'
  }
};

// Retrieve the full path of given page
const retrieve = page => {
  return pageData[page].parent;
};

// Export function
module.exports = {
  pageData: pageData,
  retrieve: retrieve
};
