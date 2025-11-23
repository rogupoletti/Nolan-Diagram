

import { QuizQuestion, Language } from './types';

export const CATEGORY_KEYS = ["libertarian", "left_liberal", "right_conservative", "authoritarian", "centrist", "economic_right", "economic_left", "social_libertarian", "social_authoritarian"];
export const VALID_LANGUAGES: Language[] = ['en', 'es', 'pt-BR'];


export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: '1',
    text: {
      en: "Government should not control prices or wages.",
      es: "El gobierno no debería controlar los precios ni los salarios.",
      'pt-BR': "O governo não deve controlar preços ou salários."
    },
    type: 'economic',
    weight: 1
  },
  {
    id: '2',
    text: {
      en: "The government should provide a universal basic income.",
      es: "El gobierno debería proporcionar un ingreso básico universal.",
      'pt-BR': "O governo deveria fornecer uma renda básica universal."
    },
    type: 'economic',
    weight: -1
  },
  {
    id: '3',
    text: {
      en: "People should have the right to own firearms with minimal government restriction.",
      es: "La gente debería tener derecho a poseer armas de fuego con una restricción gubernamental mínima.",
      'pt-BR': "As pessoas deveriam ter o direito de possuir armas de fogo com restrição mínima do governo."
    },
    type: 'personal',
    weight: 1
  },
  {
    id: '4',
    text: {
      en: "Recreational drug use should be decriminalized.",
      es: "El uso de drogas recreativas debería ser despenalizado.",
      'pt-BR': "O uso de drogas recreativas deveria ser descriminalizado."
    },
    type: 'personal',
    weight: 1
  },
  {
    id: '5',
    text: {
      en: "Free trade with other countries is beneficial and should be encouraged.",
      es: "El libre comercio con otros países es beneficioso y debería fomentarse.",
      'pt-BR': "O livre comércio com outros países é benéfico e deve ser incentivado."
    },
    type: 'economic',
    weight: 1
  },
  {
    id: '6',
    text: {
      en: "The government should subsidize renewable energy industries.",
      es: "El gobierno debería subsidiar las industrias de energía renovable.",
      'pt-BR': "O governo deveria subsidiar as indústrias de energia renovável."
    },
    type: 'economic',
    weight: -1
  },
  {
    id: '7',
    text: {
      en: "Freedom of speech should protect even unpopular or offensive opinions.",
      es: "La libertad de expresión debería proteger incluso las opiniones impopulares u ofensivas.",
      'pt-BR': "A liberdade de expressão deve proteger até mesmo opiniões impopulares ou ofensivas."
    },
    type: 'personal',
    weight: 1
  },
  {
    id: '8',
    text: {
      en: "Government surveillance of citizens is a necessary tool to combat crime.",
      es: "La vigilancia gubernamental de los ciudadanos es una herramienta necesaria para combatir el crimen.",
      'pt-BR': "A vigilância governamental dos cidadãos é uma ferramenta necessária para combater o crime."
    },
    type: 'personal',
    weight: -1
  },
  {
    id: '9',
    text: {
      en: "Taxes on businesses should be significantly lowered to promote economic growth.",
      es: "Los impuestos a las empresas deberían reducirse significativamente para promover el crecimiento económico.",
      'pt-BR': "Os impostos sobre as empresas deveriam ser significativamente reduzidos para promover o crescimento econômico."
    },
    type: 'economic',
    weight: 1
  },
  {
    id: '10',
    text: {
      en: "The government should mandate a higher minimum wage.",
      es: "El gobierno debería establecer un salario mínimo más alto.",
      'pt-BR': "O governo deveria determinar um salário mínimo mais alto."
    },
    type: 'economic',
    weight: -1
  },
  {
    id: '11',
    text: {
      en: "Same-sex marriage should be legally recognized.",
      es: "El matrimonio entre personas del mismo sexo debería ser reconocido legalmente.",
      'pt-BR': "O casamento entre pessoas do mesmo sexo deveria ser legalmente reconhecido."
    },
    type: 'personal',
    weight: 1
  },
  {
    id: '12',
    text: {
      en: "Public education should be replaced by a voucher system for private schools.",
      es: "La educación pública debería ser reemplazada por un sistema de vales para escuelas privadas.",
      'pt-BR': "A educação pública deveria ser substituída por um sistema de vouchers para escolas particulares."
    },
    type: 'economic',
    weight: 1
  },
  {
    id: '13',
    text: {
      en: "Immigration laws should be less restrictive.",
      es: "Las leyes de inmigración deberían ser menos restrictivas.",
      'pt-BR': "As leis de imigração deveriam ser menos restritivas."
    },
    type: 'personal',
    weight: 1
  },
  {
    id: '14',
    text: {
      en: "Government regulations are often a burden on the economy.",
      es: "Las regulaciones gubernamentales son a menudo una carga para la economía.",
      'pt-BR': "As regulamentações governamentais são frequentemente um fardo para a economia."
    },
    type: 'economic',
    weight: 1
  }
];

export const ANSWER_OPTIONS = [
  { labelKey: 'answers.strongly_agree', value: 2 },
  { labelKey: 'answers.agree', value: 1 },
  { labelKey: 'answers.neutral', value: 0 },
  { labelKey: 'answers.disagree', value: -1 },
  { labelKey: 'answers.strongly_disagree', value: -2 }
];