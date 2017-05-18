import BlockOverlay from './blockOverlay';
import KeyMapper from '../keyMapper';
import i18n from '../i18n';

/**
 * CodeBlockGadget
 * @class CodeBlockGadget
 */
class CodeBlockGadget extends BlockOverlay {
    constructor({eventManager, container, languages}) {
        super({
            eventManager,
            container,
            attachedSelector: 'pre'
        });

        this._languages = languages;
        this._popupCodeBlockLanguages = null;

        this._initDOM();
        this._initDOMEvent();
    }

    _initDOM() {
        this.$el.addClass('code-block-header');
        this._$inputLanguage = $(`<input type="text" class="te-input-language" maxlength="20" placeholder="${i18n.get('Choose language')}">`);
        this.$el.append(this._$inputLanguage);
    }

    _initDOMEvent() {
        this._$inputLanguage.on('focus', () => {
            this._showPopupCodeBlockLanguages();
        });
        this._$inputLanguage.on('focusout', () => {
            this._restoreInputLanguage();
        });
        this._$inputLanguage.on('keydown', event => {
            if (this._popupCodeBlockLanguages) {
                switch (event.which) {
                    case KeyMapper.keyCode('UP'):
                        this._popupCodeBlockLanguages.prev();
                        event.preventDefault();
                        break;
                    case KeyMapper.keyCode('DOWN'):
                        this._popupCodeBlockLanguages.next();
                        event.preventDefault();
                        break;
                    case KeyMapper.keyCode('ENTER'):
                    case KeyMapper.keyCode('TAB'): {
                        const language = this._popupCodeBlockLanguages.getCurrentLanguage();
                        this._$inputLanguage.val(language);
                        this._storeInputLanguage();
                        event.preventDefault();
                        break;
                    }
                    default:
                        this._popupCodeBlockLanguages.hide();
                }
            } else if (event.which === KeyMapper.keyCode('ENTER') || event.which === KeyMapper.keyCode('TAB')) {
                this._storeInputLanguage();
                event.preventDefault();
            }
        });
    }

    /**
     * code block header height
     * @private
     * @memberof CodeBlockGadget
     * @returns {number} code block header height
     */
    _getCodeBlockHeaderHeight() {
        if (!this._codeBlockHeaderHeight) {
            const style = window.getComputedStyle(this.getAttachedElement(), ':before');
            this._codeBlockHeaderHeight = parseInt(style.getPropertyValue('height'), 10)
                + parseInt(style.getPropertyValue('padding-top'), 10)
                + parseInt(style.getPropertyValue('padding-bottom'), 10);
        }

        return this._codeBlockHeaderHeight;
    }

    /**
     * show popup
     * @private
     * @memberof CodeBlockGadget
     */
    _showPopupCodeBlockLanguages() {
        this.active = true;
        const offset = this.$el.offset();
        this._popupCodeBlockLanguages = this._eventManager.emitReduce('openPopupCodeBlockLanguages', {
            language: this._getLanguage(),
            offset: {
                left: offset.left,
                top: offset.top + this._getCodeBlockHeaderHeight()
            },
            callback: {
                selected: language => {
                    this._$inputLanguage.val(language);
                    this._storeInputLanguage();
                },
                dismissed: () => {
                    this._popupCodeBlockLanguages = null;
                }
            }
        });
    }

    /**
     * hide popup
     * @private
     * @memberof CodeBlockGadget
     */
    _hidePopupCodeBlockLanguages() {
        this._eventManager.emit('closePopupCodeBlockLanguages');
    }

    _getLanguage() {
        const attachedElement = this.getAttachedElement();

        return attachedElement ? attachedElement.getAttribute('data-language') : null;
    }

    _setLanguage(language) {
        const attachedElement = this.getAttachedElement();
        if (attachedElement) {
            attachedElement.setAttribute('data-language', language);
        }
    }

    /**
     * store selection & hide popup
     * @private
     * @memberof CodeBlockGadget
     */
    _storeInputLanguage() {
        this._setLanguage(this._$inputLanguage.val());
        this._hidePopupCodeBlockLanguages();
    }

    /**
     * restore selection & hide popup
     * @private
     * @memberof CodeBlockGadget
     */
    _restoreInputLanguage() {
        this._$inputLanguage.val(this._getLanguage());
        this._hidePopupCodeBlockLanguages();
    }

    /**
     * on gadget shown
     * @memberof CodeBlockGadget
     * @protected
     * @override
     */
    onShow() {
        this._restoreInputLanguage();
    }

    /**
     * on gadget hidden
     * @memberof CodeBlockGadget
     * @protected
     * @override
     */
    onHide() {
        this._restoreInputLanguage();
    }

    /**
     * update gadget position
     * @memberof CodeBlockGadget
     * @protected
     * @override
     */
    syncLayout() {
        super.syncLayout();
        this.$el.height(this._getCodeBlockHeaderHeight());
    }
}

module.exports = CodeBlockGadget;
