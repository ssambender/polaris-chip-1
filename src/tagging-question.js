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
    `;
  }


  render() {
    return html`

      <div id="tagging-question">
        <confetti-container id="confetti">
          <img id="image" src=${this.imageURL}>
          <div id="question">${this.question}</div>
          <div id="droppedTags" @dragover=${this.handleDragOver} @drop=${this.handleDrop}>
              <div id="dropTagHint">[Drop tags here]</div>
          </div>
          <div id="bankedTags">
          </div>
        </confetti-container>
      </div>

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

    if (button) {
        button.remove();
        droppedTags.appendChild(button);
    }
  }


  static get properties() {
    return {
      question: { type: String },
      imageURL: { type: String },
    };
  }
}

globalThis.customElements.define(TaggingQuestion.tag, TaggingQuestion);
