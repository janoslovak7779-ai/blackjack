function Modal({result, hideModalDisplay}) {

    return(
        <div
            role="dialog"
            aria-modal="true"
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ zIndex: 1055, backgroundColor: "rgba(0, 0, 0, 0.6)"}}
        >
            <div
                className="modal-dialog modal-dialog-centered modal-lg mx-auto"
                style={{ maxWidth: 1200, width: "95vw"}}
            >
                <div className={`modal-content text-white bg-${result.type}`}>
                    <div className="modal-body fw-bold py-4 text-center">{result.message}</div>
                    <div className="modal-footer border-0 justify-content-center">
                        <button type="button" className="btn btn-secondary mb-4" onClick={hideModalDisplay}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default Modal;