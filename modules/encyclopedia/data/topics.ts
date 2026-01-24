export interface DebateTopic {
  id: string;
  title: string;
  category: 'Fundamentos' | 'Estrategia' | 'Refutación' | 'Estilo';
  description: string;
  content: string[]; // Array of paragraphs
}

export const ENCYCLOPEDIA_TOPICS: DebateTopic[] = [
  {
    id: 'are-model',
    title: 'Modelo ARE',
    category: 'Fundamentos',
    description: 'La estructura básica de un argumento sólido.',
    content: [
      'El modelo ARE es el estándar fundamental para construir argumentos lógicos y persuasivos en el debate competitivo.',
      'A - Afirmación (Assertion): Es la tesis o el titular de tu argumento. Qué es lo que quieres probar de manera concisa.',
      'R - Razonamiento (Reasoning): Es el "por qué" de tu afirmación. Aquí explicas la lógica causal paso a paso. Es la parte más importante para ganar la carga de la prueba.',
      'E - Evidencia (Evidence): Datos, ejemplos, analogías o hechos que respaldan tu razonamiento y lo anclan a la realidad.'
    ]
  },
  {
    id: 'weighing',
    title: 'Ponderación (Weighing)',
    category: 'Estrategia',
    description: 'Cómo comparar argumentos y explicar por qué los tuyos importan más.',
    content: [
      'La ponderación es el arte de comparar impactos cuando ambos equipos han probado sus puntos. No basta con tener razón, hay que demostrar que tu razón es más importante.',
      'Criterios comunes de ponderación:',
      '1. Magnitud: ¿A cuántas personas afecta? (Cantidad)',
      '2. Probabilidad: ¿Qué tan seguro es que ocurra este impacto?',
      '3. Vulnerabilidad: ¿Afecta a grupos privilegiados o marginados?',
      '4. Reversibilidad: Si tomamos esta medida y sale mal, ¿podemos volver atrás?',
      '5. Plazo: ¿El impacto es inmediato o a largo plazo?'
    ]
  },
  {
    id: 'refutation-types',
    title: 'Tipos de Refutación',
    category: 'Refutación',
    description: 'Estrategias para desmontar el caso contrario.',
    content: [
      'No todas las refutaciones son iguales. Identificar cómo atacar un argumento es clave.',
      '1. Negación de la verdad: El argumento contrario es simplemente falso (requiere evidencia fuerte).',
      '2. Negación del nexo causal: El razonamiento tiene saltos lógicos; A no lleva necesariamente a B.',
      '3. Vuelta de caso (Flip): Asumir que su lógica es cierta, pero demostrar que el impacto es opuesto al que dicen (ej. "dices que esto ayuda a los pobres, pero en realidad los perjudica por X").',
      '4. Mitigación: Aceptar que el argumento es cierto, pero demostrar que su impacto es irrelevante o muy pequeño en comparación con el tuyo.'
    ]
  },
  {
    id: 'fiat',
    title: 'El Fiat',
    category: 'Fundamentos',
    description: 'La asunción de que la moción se implementa.',
    content: [
      'En debate, asumimos que la moción tiene "Fiat", es decir, que el gobierno tiene la capacidad política y legal para implementar la medida.',
      'La oposición no puede argumentar "esto nunca se aprobaría en el congreso" o "es inconstitucional". El debate se centra en si "deberíamos" hacerlo, no en si "podríamos" hacerlo.',
      'Sin embargo, el Fiat no es una varita mágica: cuesta recursos (capital político, dinero) y debe implementarse de una manera razonable.'
    ]
  },
  {
    id: 'characterization',
    title: 'Caracterización',
    category: 'Estilo',
    description: 'Pintar el contexto para hacer los argumentos plausibles.',
    content: [
      'La caracterización es la descripción detallada de los actores, el contexto o la situación antes de lanzar los argumentos.',
      'Un argumento lógico puede fallar si la caracterización del mundo no es creíble. Debes explicar cómo piensan los actores involucrados, cuáles son sus incentivos y cómo funciona el statu quo.',
      'Una buena caracterización debe ser neutral y realista, no una caricatura que favorezca descaradamente a tu lado (hombre de paja).'
    ]
  },
  {
    id: 'extension-bp',
    title: 'Extensión en BP',
    category: 'Estrategia',
    description: 'El rol de las cámaras bajas en Parlamentario Británico.',
    content: [
      'La extensión es el material nuevo que aporta la Cámara Baja para diferenciarse de su Cámara Alta.',
      'Tipos de extensión:',
      '1. Nuevos argumentos: Puntos que la Alta no tocó en absoluto.',
      '2. Análisis más profundo: Tomar una premisa que la Alta solo mencionó y mecanizarla a fondo.',
      '3. Refutación integrada: Ganar el debate refutando a la oposición de una manera que la Alta no hizo.',
      '4. Ponderación: Aceptar el caso de la Alta pero explicar por qué es importante (impactar).'
    ]
  }
];