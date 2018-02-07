const archive = require('./services/archiveOrgService');

archive.getCreators(20, (creators) => {
  console.log(creators);
});
