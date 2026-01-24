export interface Motion {
  id: string;
  text: string;
  topic: 'Política' | 'Economía' | 'Relaciones Internacionales' | 'Justicia' | 'Sociedad' | 'Tecnología' | 'Medio Ambiente' | 'Educación';
  type: 'Política (EC haría)' | 'Análisis (EC cree que)' | 'Lamentar (EC lamenta)' | 'Actor (EC, como X)' | 'Valor (EC prefiere)';
  difficulty: 'Novato' | 'Intermedio' | 'Avanzado';
}

export const MOTIONS_REPOSITORY: Motion[] = [
  {
    id: '1',
    text: 'EC prohibiría la publicación de encuestas electorales durante las campañas políticas.',
    topic: 'Política',
    type: 'Política (EC haría)',
    difficulty: 'Novato'
  },
  {
    id: '2',
    text: 'EC cree que el movimiento feminista debería excluir a los hombres de sus espacios de toma de decisiones.',
    topic: 'Sociedad',
    type: 'Análisis (EC cree que)',
    difficulty: 'Intermedio'
  },
  {
    id: '3',
    text: 'EC lamenta la narrativa de que "el amor romántico lo puede todo".',
    topic: 'Sociedad',
    type: 'Lamentar (EC lamenta)',
    difficulty: 'Novato'
  },
  {
    id: '4',
    text: 'EC implementaría una Renta Básica Universal sustituyendo todos los demás subsidios sociales.',
    topic: 'Economía',
    type: 'Política (EC haría)',
    difficulty: 'Avanzado'
  },
  {
    id: '5',
    text: 'EC, como la OTAN, ofrecería membresía inmediata a Ucrania.',
    topic: 'Relaciones Internacionales',
    type: 'Actor (EC, como X)',
    difficulty: 'Intermedio'
  },
  {
    id: '6',
    text: 'EC prefiere un mundo sin armas nucleares a un mundo con la doctrina de Destrucción Mutua Asegurada.',
    topic: 'Relaciones Internacionales',
    type: 'Valor (EC prefiere)',
    difficulty: 'Avanzado'
  },
  {
    id: '7',
    text: 'EC prohibiría el desarrollo de Inteligencia Artificial que sea indistinguible de un ser humano.',
    topic: 'Tecnología',
    type: 'Política (EC haría)',
    difficulty: 'Intermedio'
  },
  {
    id: '8',
    text: 'EC cree que las democracias en desarrollo deberían priorizar el crecimiento económico sobre la protección del medio ambiente.',
    topic: 'Medio Ambiente',
    type: 'Análisis (EC cree que)',
    difficulty: 'Intermedio'
  },
  {
    id: '9',
    text: 'EC eliminaría las calificaciones numéricas en la educación primaria y secundaria.',
    topic: 'Educación',
    type: 'Política (EC haría)',
    difficulty: 'Novato'
  },
  {
    id: '10',
    text: 'EC, como el Papa Francisco, permitiría el matrimonio de sacerdotes.',
    topic: 'Sociedad',
    type: 'Actor (EC, como X)',
    difficulty: 'Novato'
  },
  {
    id: '11',
    text: 'EC cree que la prisión permanente revisable es una medida justa para crímenes de sangre.',
    topic: 'Justicia',
    type: 'Análisis (EC cree que)',
    difficulty: 'Intermedio'
  },
  {
    id: '12',
    text: 'EC nacionalizaría las empresas farmacéuticas.',
    topic: 'Economía',
    type: 'Política (EC haría)',
    difficulty: 'Avanzado'
  }
];