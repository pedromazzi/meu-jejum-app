import React, { useState, useCallback, useEffect } from 'react';
import { Search, ChevronRight, Download } from 'lucide-react'; // Importar Download icon

// Interface para um artigo
interface Article {
  id: number;
  category: string;
  icon: string | React.ElementType; // Pode ser string (emoji) ou componente React (SVG)
  title: string;
  description: string;
  content: string;
}

// Lista completa de artigos
const allArticles: Article[] = [
  // CATEGORIA: BÁSICO
  {
    id: 1,
    category: 'basico',
    icon: '📖',
    title: 'O que é Jejum Intermitente?',
    description: 'Entenda como funciona',
    content: `Jejum intermitente é um padrão alimentar que alterna entre períodos de jejum e alimentação.

Não é uma dieta que diz o QUE você deve comer, mas sim QUANDO você deve comer.

Os métodos mais populares são:
- 16/8: 16 horas de jejum, 8 horas de alimentação
- 18/6: 18 horas de jejum, 6 horas de alimentação
- 20/4: 20 horas de jejum, 4 horas de alimentação
- OMAD: Uma refeição por dia (23h de jejum)

Durante o jejum, seu corpo passa por várias mudanças que favorecem a queima de gordura e outros benefícios à saúde.`
  },
  {
    id: 2,
    category: 'basico',
    icon: '⏱️',
    title: 'Protocolos Mais Usados',
    description: '16:8, 18:6, 20:4 e OMAD',
    content: `Existem vários protocolos de jejum intermitente. Veja os principais:

16/8 (INICIANTE)
- 16 horas de jejum
- 8 horas para comer
- Exemplo: jejua das 20h às 12h
- Mais popular e fácil de manter

18/6 (INTERMEDIÁRIO)
- 18 horas de jejum
- 6 horas para comer
- Exemplo: jejua das 20h às 14h
- Maior queima de gordura

20/4 (AVANÇADO)
- 20 horas de jejum
- 4 horas para comer
- Exemplo: jejua das 20h às 16h
- Resultados mais rápidos

OMAD - Uma Refeição por Dia (ESPECIALISTA)
- 23 horas de jejum
- 1 hora para comer (uma refeição)
- Exemplo: come apenas no jantar
- Máxima eficiência

Comece pelo 16/8 e aumente gradualmente conforme se adapta.`
  },
  {
    id: 3,
    category: 'basico',
    icon: '❓',
    title: 'Mitos vs. Verdades',
    description: 'Quebre 10 mitos sobre jejum',
    content: `Vamos esclarecer os principais mitos sobre jejum intermitente:

MITO: "Jejum deixa você fraco"
VERDADE: Após adaptação, aumenta energia e foco mental.

MITO: "Vai perder massa muscular"
VERDADE: O jejum preserva músculos e queima gordura preferencialmente.

MITO: "Precisa comer de 3 em 3 horas"
VERDADE: Não há evidências de que isso acelera metabolismo.

MITO: "Café da manhã é a refeição mais importante"
VERDADE: Não há nada de especial no café da manhã.

MITO: "Vai ficar com fome o tempo todo"
VERDADE: A fome diminui após alguns dias de adaptação.

MITO: "É perigoso para a saúde"
VERDADE: É seguro para a maioria das pessoas saudáveis.

MITO: "Vai deixar o metabolismo lento"
VERDADE: Jejum pode aumentar metabolismo em 3-14%.

MITO: "Não pode fazer exercícios em jejum"
VERDADE: Treinar em jejum pode aumentar queima de gordura.

Sempre consulte um médico antes de iniciar.`
  },
  // CATEGORIA: DURANTE JEJUM
  {
    id: 4,
    category: 'durante',
    icon: '☕',
    title: 'Café Quebra o Jejum?',
    description: 'A verdade sobre café',
    content: `Esta é uma das perguntas mais comuns!

CAFÉ PRETO (SEM NADA) - NÃO QUEBRA ✅
- Café puro tem ~2 calorias
- Não afeta o jejum
- Pode aumentar queima de gordura
- Reduz sensação de fome

CAFÉ COM LEITE - QUEBRA ❌
- Leite tem proteína e açúcar
- Interrompe o jejum
- Ativa digestão

CAFÉ COM AÇÚCAR - QUEBRA ❌
- Açúcar eleva insulina
- Interrompe o jejum imediatamente

CAFÉ COM ADOÇANTE - DEPENDE ⚠️
- Alguns adoçantes podem elevar insulina
- Melhor evitar durante jejum

CAFÉ COM ÓLEO DE COCO/MANTEIGA - QUEBRA ❌
- Gordura tem calorias
- Interrompe o jejum
- Reserve para janela de alimentação

RESUMO: Café preto = liberado. Qualquer adição = quebra jejum.`
  },
  {
    id: 5,
    category: 'durante',
    icon: '💧',
    title: 'O que Pode Consumir?',
    description: 'Lista completa',
    content: `Durante o jejum, você pode consumir:

LIBERADO ✅
- Água (à vontade)
- Café preto (sem açúcar/leite)
- Chá verde, preto ou branco (sem açúcar)
- Água com gás
- Água com limão (máximo meio limão)

EVITAR ⚠️
- Refrigerante zero (pode elevar insulina)
- Adoçantes artificiais
- Goma de mascar (mesmo sem açúcar)
- Suplementos em cápsula (ok se realmente necessário)

PROIBIDO ❌
- Qualquer alimento
- Sucos (mesmo naturais)
- Leite ou bebidas lácteas
- Caldos (tem calorias)
- Vitaminas em pó
- Qualquer bebida com calorias

REGRA DE OURO:
Se tem mais de 5-10 calorias, quebra o jejum.

Mantenha-se hidratado bebendo bastante água!`
  },
  // CATEGORIA: RESULTADOS
  {
    id: 6,
    category: 'resultados',
    icon: '⏰',
    title: 'Quanto Tempo Para Resultados?',
    description: 'Timeline realista',
    content: `Veja o que esperar em cada fase:

SEMANA 1-2: ADAPTAÇÃO
- Pode sentir fome
- Possível dor de cabeça leve
- Corpo se adaptando
- Perda inicial de peso (água)

SEMANA 3-4: AJUSTE
- Fome diminui bastante
- Mais energia
- Foco mental melhora
- Começo de queima de gordura real

MÊS 2: RESULTADOS VISÍVEIS
- Perda de gordura evidente
- Roupas mais folgadas
- Mais disposição
- Jejum fica natural

MÊS 3+: TRANSFORMAÇÃO
- Mudança corporal clara
- Jejum virou hábito
- Benefícios máximos
- Energia constante

IMPORTANTE:
Resultados variam por pessoa. Fatores como dieta, exercícios e genética influenciam.

Seja paciente e consistente!`
  },
  // CATEGORIA: SEGURANÇA
  {
    id: 7,
    category: 'seguranca',
    icon: '⚠️',
    title: 'Quem NÃO Deve Fazer Jejum?',
    description: 'Contraindicações importantes',
    content: `Jejum intermitente NÃO é recomendado para:

CONTRAINDICAÇÕES ABSOLUTAS ❌
- Grávidas ou amamentando
- Menores de 18 anos
- Diabetes tipo 1 (sem acompanhamento)
- Histórico de transtornos alimentares
- Desnutrição ou abaixo do peso
- Hipoglicemia crônica

CONSULTE MÉDICO ANTES ⚠️
- Diabetes tipo 2 (pode precisar ajustar medicação)
- Pressão alta (medicamentos podem precisar ajuste)
- Histórico de pedras nos rins
- Refluxo gastroesofágico
- Toma medicação regular
- Condições médicas específicas

SINAIS DE ALERTA - PARE O JEJUM:
- Tontura persistente
- Tremores intensos
- Confusão mental
- Palpitações cardíacas
- Desmaios
- Mal-estar extremo

Jejum é seguro para pessoas saudáveis, mas sempre consulte um profissional de saúde antes de começar.

Este app não substitui orientação médica!`
  },
  // NOVO ARTIGO: Como Instalar o App (PWA)
  {
    id: 8,
    category: 'basico',
    icon: Download, // Usando o componente de ícone Lucide
    title: 'Como Instalar o App',
    description: 'Guia completo de instalação do PWA',
    content: `Instale o MeuJejum na tela inicial do seu celular ou computador para acesso mais rápido e notificações!

**📱 ANDROID (Chrome):**

1.  Abra o MeuJejum no navegador Chrome.
2.  Toque no menu (⋮) no canto superior direito.
3.  Selecione "Adicionar à tela inicial" ou "Instalar aplicativo".
4.  Confirme tocando em "Adicionar" ou "Instalar".
5.  Pronto! O ícone aparecerá na sua tela inicial.

**🍎 IPHONE/IPAD (Safari):**

1.  Abra o MeuJejum no Safari.
2.  Toque no ícone de compartilhar (um quadrado com uma seta para cima 📤) na barra inferior.
3.  Role para baixo e toque em "Adicionar à Tela de Início".
4.  Edite o nome se desejar.
5.  Toque em "Adicionar" no canto superior direito.
6.  Pronto! O app aparecerá na sua tela inicial.

**💻 DESKTOP (Chrome/Edge):**

1.  Abra o MeuJejum no Chrome ou Edge.
2.  Clique no ícone de instalação (um pequeno monitor com um sinal de mais ➕) na barra de endereço (geralmente à direita).
3.  Ou vá em Menu (⋮) → "Instalar MeuJejum".
4.  Clique em "Instalar".
5.  O app abrirá em uma janela própria.

**✨ VANTAGENS DE INSTALAR:**

-   Acesso mais rápido (sem abrir navegador).
-   Notificações de jejum e hidratação.
-   Funciona mesmo offline (funcionalidades básicas).
-   Interface sem distrações do navegador.
-   Parece um app nativo.

**⚠️ IMPORTANTE:**

Você **NÃO** precisa baixar nada da App Store ou Play Store. É um Progressive Web App (PWA) que funciona direto do navegador!

Qualquer dúvida, entre em contato.`
  }
];

const categories = [
  { id: 'todos', name: 'Todos' },
  { id: 'basico', name: 'Básico' },
  { id: 'durante', name: 'Durante Jejum' },
  { id: 'resultados', name: 'Resultados' },
  { id: 'seguranca', name: 'Segurança' }
];

const Aprender = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

  // Efeito para scrollar para o artigo de instalação se o hash estiver presente
  useEffect(() => {
    if (window.location.hash === '#instalacao-pwa') {
      const installArticle = allArticles.find(article => article.id === 8); // ID do artigo de instalação
      if (installArticle) {
        setSelectedCategory('basico'); // Garante que a categoria esteja selecionada
        setExpandedArticle(installArticle.id); // Expande o artigo
        // Pequeno atraso para garantir que o DOM esteja renderizado antes de scrollar
        setTimeout(() => {
          const element = document.getElementById(`article-${installArticle.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  }, []);

  const filteredArticles = allArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleArticleClick = useCallback((articleId: number) => {
    setExpandedArticle(prev => (prev === articleId ? null : articleId));
  }, []);

  return (
    <div className="page-container aprender-page">
      <div className="aprender-header">
        <h1 className="aprender-title">📚 Aprender</h1>
      </div>

      {/* Barra de Busca */}
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar artigos..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categorias (Tabs horizontais) */}
      <div className="categories-tabs">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory(category.id);
              setExpandedArticle(null); // Fecha qualquer artigo expandido ao mudar de categoria
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Lista de Artigos */}
      <div className="articles-list">
        {filteredArticles.length > 0 ? (
          filteredArticles.map(article => (
            <div key={article.id} id={`article-${article.id}`} className="article-card" onClick={() => handleArticleClick(article.id)}>
              <div className="article-header">
                <span className="article-icon">
                  {typeof article.icon === 'string' ? article.icon : <article.icon size={32} />}
                </span>
                <div className="article-info">
                  <p className="article-title">{article.title}</p>
                  <p className="article-description">{article.description}</p>
                </div>
                <ChevronRight size={20} className="article-arrow" />
              </div>
              {expandedArticle === article.id && (
                <div className="article-content">
                  {article.content}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="no-results-text">Nenhum artigo encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default Aprender;