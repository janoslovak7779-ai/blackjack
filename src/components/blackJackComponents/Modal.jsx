// `src/src/components/Modal.jsx`
import "./Modal.css";

function Modal({ result, hideModalDisplay }) {
    let title;
    let badgeClass;


    switch (result.type) {
        case "success": {
            title = "Win";
            badgeClass = "modal-casino__badge--success";
            break;
        }
        case "warning": {
            title = "Push";
            badgeClass = "modal-casino__badge--warning";
            break;
        }
        case "danger": {
            title = "Lose";
            badgeClass = "modal-casino__badge--danger";
            break;
        }
        default: {
            title = "Info";
            badgeClass = "modal-casino__badge--info";
            break;
        }
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="modal-casino__backdrop"
            onClick={hideModalDisplay}
        >
            <div
                className="modal-casino"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-casino__header">
                    <div className={`modal-casino__badge ${badgeClass}`}>{title}</div>
                    <button
                        type="button"
                        className="btn-close btn-close-white modal-casino__close"
                        aria-label="Close"
                        onClick={hideModalDisplay}
                    />
                </div>

                <div className="modal-casino__body">
                    <p className="modal-casino__message">{result.message}</p>
                </div>

                <div className="modal-casino__footer">
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={hideModalDisplay}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;
