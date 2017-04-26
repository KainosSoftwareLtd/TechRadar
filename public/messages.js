$(function() {
    window.TechRadar = window.TechRadar || {};

    function addMessage(type, message) {
        var messageDiv = $('<div>');
        messageDiv.addClass('alert alert-dismissible alert-' + type);
        messageDiv.text(message);
        messageDiv.append('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>');
        $('#messages').append(messageDiv);
    }

    function showMessagesFromSessionStorage() {
        var msgRaw = sessionStorage.getItem("messages");
        var messages = msgRaw && msgRaw !== "undefined" ? JSON.parse(msgRaw) : null;
        if (messages) {
            TechRadar.viewFlashMessages(messages);
        }
        sessionStorage.removeItem("messages");
    }

    /**
     * View flash messages
     *
     * @param messages
     */
    TechRadar.viewFlashMessages = function (messages) {
        Object.keys(messages).forEach(function (type) {
            messages[type].forEach(function (message) {
                addMessage(type, message);
            });
        });

        TechRadar.fadeOutSuccess();
    };

    /**
     * Clear flash messages
     */
    TechRadar.clearFlashMessages = function () {
        $('#messages').empty();
    };

    /**
     * Fades out success messages after 3 seconds.
     */
    TechRadar.fadeOutSuccess = function () {
        window.setTimeout(function() {
            $(".alert-success").fadeTo(500, 0).slideUp(500, function(){
                $(this).remove();
            });
        }, 3000);
    };

    if($("#messages").length) {
        showMessagesFromSessionStorage();
        TechRadar.fadeOutSuccess();
    }
});