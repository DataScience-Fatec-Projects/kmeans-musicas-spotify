Projeto final
Data de conclusão 24 de novembro de 2026 às 23:59
•
Vários envios permitidos
Instruções
Cada grupo (até 6 pessoas!) deverá escolher um tema/conjunto de dados real (ou simulado, com justificativa) para aplicar o algoritmo K-Means. O objetivo principal é criar um notebook interativo no Google Colab que funcione como uma aula completa, cobrindo todos os aspectos solicitados. O tema da aula é “uso de algoritmo K-Means em aplicações de Ciência de Dados”. O notebook criado no Google

Colab deve ser estruturado e detalhado, contendo as seguintes seções: 



I. Introdução e Contextualização 

Conceitos Fundamentais: Explicação clara e concisa sobre o que é o Aprendizado Não Supervisionado e, especificamente, o método de agrupamento (Clustering). 
O Algoritmo K-Means: Descrever o funcionamento do K-Means (inicialização, atribuição de clusters, atualização de centroides, critério de parada). 
Métodos de Avaliação: Mencionar brevemente métricas importantes como o Método do Cotovelo (Elbow Method) para determinar o k ideal. 

II. Ferramentas de Trabalho (Scikit-learn e Python)  

A Biblioteca scikit-learn: Breve introdução à biblioteca, focando em como ela implementa o KMeans (ex: sklearn.cluster.KMeans). 
Importações: Listar e explicar as bibliotecas Python necessárias (ex: numpy, pandas, matplotlib, seaborn, sklearn). 

III. Escolha do Tema e Preparação dos Dados  

Tema Escolhido: Apresentar o tema escolhido pelo grupo (ex: segmentação de clientes, agrupamento de espécies de flores, etc.). 
Conjunto de dados (dataset): 
Onde o dataset foi obtido (link para o recurso, se externo). 
Descrição das variáveis (features). 
Pré-processamento: Mostrar o código para carregamento, tratamento de dados ausentes (se houver) e, crucialmente, a normalização/padronização dos dados (ex: StandardScaler), justificando sua necessidade para o K-Means. 
 

IV. Implementação e Aplicação Prática  

Definindo k: Usar o Método do Cotovelo para justificar a escolha do número de clusters (k) a ser utilizado. 
Execução do K-Means: 
Instanciar o modelo: KMeans(n_clusters=k_escolhido, ...) 
Treinar o modelo: .fit(dados_padronizados) 
Obter os resultados: Centroides e rótulos de cluster (.labels_). 
Visualização: Criar pelo menos duas visualizações gráficas distintas (usando matplotlib ou seaborn): 
Uma que mostre a separação dos clusters (ex: em um gráfico de dispersão 2D das duas features mais importantes, colorindo os pontos pelos rótulos). 
Outra que represente os centroides em relação aos pontos. 

V. Análise e conclusão  

Interpretação: Analisar os clusters resultantes com base no dataset original. O que significa cada grupo formado? 
Considerações Finais: Discussão sobre as limitações do K-Means e sugestões de melhorias ou próximos passos (ex: explorar outros algoritmos de agrupamento). 

Critérios de avaliação do projeto 

Rigor Técnico (40%): Correta implementação do K-Means, uso adequado do StandardScaler, e correta aplicação do método para escolha de k. 
Clareza da Explicação (30%): Qualidade e profundidade da "aula" teórica e didática, com explicações claras no Google Colab. 
Qualidade da Aplicação (20%): Relevância do tema/dataset escolhido e qualidade das visualizações geradas. 
Organização do Notebook (10%): Estrutura lógica e apresentação do conteúdo. 
 

Envio do projeto 

Enviar o link público do Google Colab.
No início, colocar o nome completo dos alunos.