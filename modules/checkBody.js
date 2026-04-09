// Vérifier que les champs d'une requête POST soient remplis
function checkBody(body, keys) {
  let isValid = true;

  for (let fields of keys) {
    if (!body[fields] || !body[fields] === "") {
      isValid = false;
    }
  }
  return isValid;
}

module.exports = { checkBody };

// EXEMPLE :
// router.post('/signup' (req, res) => {
//     if (!checkBody(req.body, ['name', 'email', 'password'])) {
//         res.json({result: false, error: 'Champs vides'})
//         return;
//     }
// })
