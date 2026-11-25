# Estudo POO · UP2

App de estudo para a 2ª unidade de **Desenvolvimento Orientado a Objetos** (UNIT 2026.2, Prof. Aldo Moura): o conteúdo postado depois da Prova UP1. Funciona no navegador, instala no celular (PWA) e guarda o progresso no aparelho, sem cadastro.

- **Resumos:** os tópicos das aulas 05 (Herança e Classe Abstrata), 06 (Polimorfismo) e 07 (Tratamento de Exceção) explicados, com os códigos das aulas.
- **Tangochō:** cartões por tema, mais uma argola com as palavras-chave do Java (extends, super, abstract, @Override, protected, static, final, try, catch, finally, throw, throws...).
- **Mapas:** um mapa mental por assunto, com prioridade.
- **Questões:** 4 tipos, com correção na hora:
  - **Múltipla escolha** (4 alternativas), inclusive "qual código não compila" e "o que o código imprime";
  - **Complete o código** (digite a palavra que falta);
  - **Ache o erro** (toque na linha que não compila);
  - **Certo ou errado**.
- **Erros:** caderno de erros, com botão para virar cartão.
- **Progresso:** acertos por assunto e por tipo de questão, meta de 75%, cópia de segurança.

Os gabaritos das questões com código foram conferidos compilando e executando em Java (javac 21).

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | Telas e estilo |
| `app.js` | Lógica do app |
| `questoes.json` | Questões (lista `q`) |
| `conteudos.json` | Resumos (`r` = blocos; `**texto**` vira negrito, `` `x` `` vira código e bloco que começa com ```` ``` ```` vira código) |
| `cartoes.json` | Cartões do Tangochō (tema `id` igual ao tópico de `conteudos.json`, ex.: `HER-2`) |
| `mapas.json` | Prioridade dos ramos dos mapas |
| `sw.js`, `manifest.webmanifest`, `icon-*.png` | Funcionar sem internet e instalar como app |

O progresso fica nas chaves `poo-up2-banco-v1` e `poo-up2-tango-v1`.

## Como adicionar questões

Cada questão é um objeto em `q`. Campos comuns: `id` (único, nunca mude), `s` (assunto: `HER`, `ABS`, `POL`, `EXC`), `f` (fonte), `q` (enunciado), `c` (comentário). O campo `t` define o tipo:

```json
{"id":"her-1","s":"HER","f":"Aula 05","q":"Enunciado","k":"código opcional","o":["A","B","C","D"],"a":0,"c":"..."}
{"id":"her-2","s":"HER","f":"Aula 05","q":"...","oc":1,"o":["código A","código B","código C","código D"],"a":1}
{"id":"her-3","s":"HER","f":"Aula 05","t":"lac","q":"Complete","k":"... {{0}}(valor); ...","a":[["super"]]}
{"id":"her-6","s":"HER","f":"Aula 05","t":"lin","q":"Toque na linha com erro","k":"linha 0\nlinha 1\n...","a":6}
{"id":"her-8","s":"HER","f":"Aula 05","t":"ce","q":"Afirmação","a":1}
```

- Sem `t`: múltipla escolha; `a` é a posição da certa (A = 0). `oc: 1` mostra as alternativas como código.
- `lac`: cada `{{n}}` vira uma lacuna; `a[n]` é a lista de respostas aceitas (espaços são ignorados, maiúsculas contam).
- `lin`: `a` é o número da linha começando em 0 (ou uma lista, se mais de uma linha valer).
- `ce`: `a` = 0 para Certo, 1 para Errado.
- Ao mudar qualquer arquivo, aumente a versão do cache em `sw.js` (`poo-up2-vN`).
