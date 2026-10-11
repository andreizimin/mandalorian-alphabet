/**
 * The quiz word pool: short lowercase words, 3 to 6 letters, a-z only.
 * Galaxy words are single names and terms from the Star Wars universe, never quoted text.
 */

// @spec QUIZ-024
export const EVERYDAY_WORDS: readonly string[] = `
tea toe ate eat oat tee too tot toot tote teat tat
ten net tan ant not ton into note tone neat tent tint
one none nine noon tin nit tie
sit set sat see sea son sin its this that than then them the hen hat hot hit his has
she shoe shot shin shine thin then those these shoe host hose nose rose rest best
art arm are ear era rat tar star start heart earth other hear here there three tree
red rod rid ride road read dear deer door dirt hard herd held hold old told sold
lid let lot lit late tale tell till tall hill hall heal real deal lead load land
can cat cot cut cup cap clap clean cold call cell coin cone corn care core
use sun run fun gun bun bus but cub rub tub hut nut nuts hunt sure true blue
man men map mat met mom mud mug moon more most must milk mind mine time team
was war way wet win wit who why wild wind wise wish with word work world
fog fig fit fat fast feet fire fish five fly fox far few foe from frog
gap get got gas game gate goat gold good grass green grow
bad bag bat bed bee big bit box boy bow bad bear beat bird boat body bone book
pet pen pin pot pan pie pig pit put park part path play plan pool pull push
kit kid key king kind kite kick knee knot
yes yet you yak yard year your young
jar jam jet job jog joy jump just
quit quiz queen quite quick
zip zoo zero zone fizz buzz
vet van vine view very vote wave
axe box fox mix six wax next exit taxi
lamp lake lane life lift like line lion list live long look lose loud love luck
dark dash data date dawn deep deck dish dive dock does done down drop drum duck dust
`
  .split(/\s+/)
  .filter(Boolean)
  .filter((w, i, all) => all.indexOf(w) === i);

// @spec QUIZ-024
export const GALAXY_WORDS: readonly string[] = `
jedi sith droid droids mando beskar creed clan force saber rebel empire
vader yoda luke leia han rey finn poe kylo ren boba fett grogu ahsoka din cara
lando padme anakin dooku maul snoke chewie
ewok jawa hutt jabba tusken krayt bantha mynock
naboo endor hoth bespin kamino scarif jakku
clone helmet armor forge falcon bounty hunter credit
`
  .split(/\s+/)
  .filter(Boolean);
