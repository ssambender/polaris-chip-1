import { LitElement, html, css } from 'lit';

export class TaggingQuestion extends LitElement {
  static get tag() {
    return 'tagging-question';
  }
  constructor() {
    super();
    this.question = 'Question goes here.';
    this.imageURL = "";
    this.currentTag;
    this.checked = false;
  }

  static get styles() {
    return css`

      :host {
        --bg: #F5F7FD;
        --chip-1: #728DE6;
      }

      span {
        background-color: orange;
        color: black;
        font-size: 24px;
        padding: 16px;
        margin: 8px;
      }

      span:hover {
        background-color: grey;
        border: 1px solid black;
      }

      #tagging-question summary {
        cursor: pointer;
        font-weight: bold;
      }

      #tagging-question {
        background: var(--bg);
        min-height: 32px;
        min-width: 64px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        padding: 8px;
        user-select: none;
        color: #374985;
        margin: 16px 0;
      }

      #tagging-question img {
        padding-top: 8px;
        max-height: 500px;
        object-fit: contain;
        max-width: 100%;
      }

      #question {
        font-family: inherit;
        text-align: center;
        padding: 8px;
        font-size: 1.5em;
        box-sizing: border-box;
        margin-bottom: 32px;
      }

      #droppedTags {
        box-sizing: border-box;
        padding: 24px 12px;
        border: dashed 2px rgba(0, 0, 0, 0.2);
        width: 90%;
        margin-left: 5%;
        display: inline-block;
        justify-content: center;
        align-items: center;
        text-align: center;
      }

      #dropTagHint {
        display: flex;  /* flex to show, none to hide */
        justify-content: center;
        align-items: center;
        opacity: 20%;
        color: black;
        font-weight: bold;
      }

      #bankedTags {
        box-sizing: border-box;
        padding: 24px 64px;
        width: 100%;
        display: inline-block;
        justify-content: center;
        align-items: center;
        text-align: center;
      }

      .chip {
        display: inline-block;
        margin: 4px 16px;
        border-radius: 100px;
        box-sizing: border-box;
        padding: 4px 12px;

        font-size: 1em;
        font-weight: normal;
        cursor: pointer;

        outline: none;
        border: solid 1px var(--chip-1);
        color: var(--chip-1);
        background: var(--bg);
      }
      .chip:nth-child(n):focus, .chip:nth-child(n):hover {
        background: var(--chip-1);
        color: var(--bg);
      }

      .correct {
        border: solid 1px #00c161;
        color: #00c161;
        background: var(--bg);
      }
      .correct:nth-child(n):focus, .correct:nth-child(n):hover {
        background: #00c161;
        color: var(--bg);
      }

      .incorrect {
        border: solid 1px #f85656;
        color: #f85656;
        background: var(--bg);
      }
      .incorrect:nth-child(n):focus, .incorrect:nth-child(n):hover {
        background: #f85656;
        color: var(--bg);
      }

      #controls {
        display: flex;
        width: 100%;
        justify-content: center;
        align-items: center;
      }
      #controls button {
        margin: 0 8px;
        border: solid 2px #374985;
        color: #374985;
        background: var(--bg);
        box-sizing: border-box;
        cursor: pointer;
        user-select: none;
        outline: none;
        padding: 4px 8px;
        font-family: inherit;
        font-size: 0.75em;
        font-weight: normal;
      }
      #controls button:focus, #controls button:hover {
        color: var(--bg);
        background: #374985;
      }

      .controlBtn {
        display: flex;
        visibility: hidden;
      }

      .disabled {
        opacity: 50% !important;
        pointer-events: none !important;
        user-select: none !important;
        background-color: var(--bg) !important;
        color: #374985 !important;
      }

      confetti-container {
        display: flex;
        flex-direction: column;
      }
    `;
  }

 
  connectedCallback() {
    super.connectedCallback();
    fetch('src/tags.json')
      .then((response) => response.json())
      .then((json) => {
        const bankedTags = this.shadowRoot.getElementById('bankedTags');
        const possibleAnswers = json.possibleAnswers;

        // Create a new tag for each key from the json file (tags.json in this case)
        const buttons = [];
        for (const key in possibleAnswers) {
          const option = possibleAnswers[key];
          const button = document.createElement('button');
          button.classList.add('chip');
          button.draggable = true;
          button.textContent = key;
          button.dataset.correct = option.correct;
          button.dataset.feedback = option.feedback;
          button.addEventListener('dragstart', this.handleDragStart.bind(this));
          buttons.push(button);
        }

        // Shuffle:
        for (let i = buttons.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [buttons[i], buttons[j]] = [buttons[j], buttons[i]];
        }

        buttons.forEach(button => {
          bankedTags.appendChild(button);
        });
      });
  }


  render() {
    return html`

      <details id="tagging-question" open>
        <summary>${this.question}</summary>
        <confetti-container id="confetti">
          <img id="image" src=${this.imageURL}>
          <div id="question">${this.question}</div>
          <div id="droppedTags" @dragover=${this.handleDragOver} @drop=${this.handleDrop}>
              <div id="dropTagHint">[Drop tags here]</div>
          </div>
          <div id="bankedTags" @dragover=${this.handleDragOverReverse} @drop=${this.handleDropReverse}>
          </div>
          <div id="controls">
              <button class="controlBtn" @click=${this.resetTags}>
                  RESET
              </button>
              <button id="checkBtn" class="controlBtn" @click=${this.checkTags}>
                  CHECK
              </button>
          </div>
        </confetti-container>
      </details>

      `;
  }


  // Drag tag jawns from answer bank -> selected answers
  handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.textContent);
    this.currentTag = event.target;
  }
  handleDragOver(event) {
    event.preventDefault();
  }
  handleDrop(event) {
    event.preventDefault();

    const data = event.dataTransfer.getData('text/plain');
    const droppedTags = this.shadowRoot.getElementById('droppedTags');
    const bankedTags = this.shadowRoot.getElementById('bankedTags');
    const button = this.currentTag;

    if (button && this.checked === false) {
        button.remove();
        droppedTags.appendChild(button);

        // Hide hint:
        this.shadowRoot.querySelector('#dropTagHint').style.display = 'none';
        // Show checkanswers button:
        const controlBtns = this.shadowRoot.querySelectorAll('.controlBtn');
        controlBtns.forEach(btn => {
            btn.style.visibility = 'visible';
        });
    }
  }

  // Reverse reverse
  handleDragStartReverse(event) {
    event.dataTransfer.setData('text/plain', event.target.textContent);
    this.currentTag = event.target;
  }
  handleDragOverReverse(event) {
    event.preventDefault();
  }
  handleDropReverse(event) {
    event.preventDefault();

    const data = event.dataTransfer.getData('text/plain');
    const droppedTags = this.shadowRoot.getElementById('droppedTags');
    const bankedTags = this.shadowRoot.getElementById('bankedTags');
    const button = this.currentTag;

    if (button && this.checked === false) {
        button.remove();
        bankedTags.appendChild(button);
        
        // Show hint again if all things are moved back:
        if (droppedTags.querySelectorAll('.chip').length === 0) {
            this.shadowRoot.querySelector('#dropTagHint').style.display = 'flex';
            // Hide check answers button:
            const controlBtns = this.shadowRoot.querySelectorAll('.controlBtn');
            controlBtns.forEach(btn => {
                btn.style.visibility = 'hidden';
            });
        }
    }
  }


  resetTags() {
    this.checked = false;

    this.shadowRoot.querySelector('#checkBtn').classList.remove('disabled');

    // Move all tags back to bank:
    const droppedTags = this.shadowRoot.getElementById('droppedTags');
    const bankedTags = this.shadowRoot.getElementById('bankedTags');
    const childrenToMove = Array.from(droppedTags.children).filter(child => child.id !== 'dropTagHint');

    childrenToMove.forEach(child => {
        bankedTags.appendChild(child);
        child.classList.remove("correct");
        child.classList.remove("incorrect");
        child.title = "";
    });

    // Shuffle:
    const buttons = Array.from(bankedTags.children);
    for (let i = buttons.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      bankedTags.insertBefore(buttons[j], buttons[i]);
    }

    // Show hint:
    this.shadowRoot.querySelector('#dropTagHint').style.display = 'flex';
    // Hide check answers button:
    const controlBtns = this.shadowRoot.querySelectorAll('.controlBtn');
    controlBtns.forEach(btn => {
        btn.style.visibility = 'hidden';
    });
  }


  checkTags() {
    if(this.checked == false){

      this.checked = true;

      let allDroppedCorrect = true;
      let allBankedCorrect = true;
  
      this.shadowRoot.querySelector('#checkBtn').classList.add('disabled');
  
      // Dropped tags:
      const droppedTags = this.shadowRoot.querySelectorAll('#droppedTags .chip');
      for (const tag of droppedTags) {
          const isCorrect = tag.dataset.correct === 'true';
          if(isCorrect){
            tag.classList.add("correct");
          }
          else {
            tag.classList.add("incorrect");
            allDroppedCorrect = false;
            tag.title = tag.dataset.feedback;
          }
      }
  
      // Banked tags:
      const bankedTags = this.shadowRoot.querySelectorAll('#bankedTags .chip');
      for (const tag of bankedTags) {
          const isCorrect = tag.dataset.correct === 'true';
          if(isCorrect){
            allBankedCorrect = false;
            tag.title = tag.dataset.feedback;
          }
      }
  
      if(allDroppedCorrect && allBankedCorrect) {
        console.log("100%!!");
        this.makeItRain();
      }
      else {
        console.log("not 100% :(");
      }

    }
  }

  makeItRain() {
    import("@lrnwebcomponents/multiple-choice/lib/confetti-container.js").then(
      (module) => {
        setTimeout(() => {
          this.shadowRoot.querySelector("#confetti").setAttribute("popped", "");
        }, 0);
      }
    );
  }


  static get properties() {
    return {
      question: { type: String },
      imageURL: { type: String },
    };
  }
}

globalThis.customElements.define(TaggingQuestion.tag, TaggingQuestion);
