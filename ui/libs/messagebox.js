jQuery.fn.center = function (absolute) {
    return this.each(function () {
        var t = jQuery(this);

        t.css({
            position: absolute ? 'absolute' : 'fixed',
            left: '50%',
            top: '50%',
            zIndex: '1000000'
        }).css({
            marginLeft: '-' + (t.outerWidth() / 2) + 'px',
            marginTop: '-' + (t.outerHeight() / 2) + 'px'
        });

        if (absolute) {
            t.css({
                marginTop: parseInt(t.css('marginTop'), 10) + jQuery(window).scrollTop(),
                marginLeft: parseInt(t.css('marginLeft'), 10) + jQuery(window).scrollLeft()
            });
        }
    });
};



var MESSAGE_TYPE = { "Information": 1, "Error": 2, "Confirmation": 3 };
var MESSAGE_STACK = []; 
var MessageBox =
{
    close: function () {
        MessageBox.successEvent = function () { MessageBox.close() }
        MessageBox.cancelEvent = function () { MessageBox.close() }
        $(".popup_messagebox").remove();
        $(".cover_background").remove();

		setTimeout("MessageBox.pop()",100);
    },
 
    successEvent: function () { MessageBox.close(); },
 
    cancelEvent: function () { MessageBox.close(); },

	push: function (messageType, header, content, onSuccess, onCancel){
		MESSAGE_STACK.push({"messageType":messageType, "header":header, "content":content, "onSuccess":onSuccess, "onCancel":onCancel});
	},

	pop: function (){
		var message = MESSAGE_STACK.pop();
		if ( message ){
			this.show(message.messageType, message.header, message.content, message.onSuccess, message.onCancel);
		}
	},
 
    show: function (messageType, header, content, onSuccess, onCancel) {

		if ( $(".popup_messagebox")[0] ){
			this.push(messageType, header, content, onSuccess, onCancel);
			return;
		}

        var popupStr = "<div class='popup_messagebox'>"
                    + getMessageContent(messageType, header, content) + "</div>";
		$("body").append(popupStr);
        $(".popup_messagebox").center();
        $(".popup_messagebox").trigger("create");
        $("body").append($('<div class="cover_background"></div>'));
 
        if (onSuccess != undefined || onSuccess != null) {
            this.successEvent = function () { onSuccess(); MessageBox.close(); }
        }
        else {
            this.successEvent = function () { MessageBox.close() }
        }
 
        if (onCancel != undefined || onCancel != null) {
            this.cancelEvent = function () { MessageBox.close(); onCancel(); }
        }
        else {
            this.cancelEvent = function () { MessageBox.close() }
        }
 
        $(".popup_messagebox #MsgOkButton").bind("click", this.successEvent);
        $(".popup_messagebox #CancelButton").bind("click", this.cancelEvent);
    }
}
 
function getMessageContent(messagType, header, content) {
    var messageContent = "";
    if (messagType == MESSAGE_TYPE.Information) {
        messageContent = '<div class="messagebox_container"><div class="messagebox_header">' + header + '</div>'
        + '<div class="messagebox_content">' + content + '</div>'
        + '</div>';
    }
    else if (messagType == MESSAGE_TYPE.Confirmation) {
        messageContent = '<div class="messagebox_container"><div class="messagebox_header">' + header + '</div>'
        + '<div class="messagebox_content">' + content + '</div>'
        + ''
        + '</div>';
    }
    else if (messagType == MESSAGE_TYPE.Error) {
        messageContent = '<div class="messagebox_container"><div class="messagebox_header">' + header + '</div>'
        + '<div class="messagebox_error_content">' + content + '</div>'
        + '</div>';
    }

    if (messagType == MESSAGE_TYPE.Confirmation) {
        messageContent += ''
        + '<div style="float:right;margin:0em 1em 1.5em 1em">'
        + '<a id="MsgOkButton" href="#" data-role="button"><span class="messagebox_button" >ok</span></a>'
        + ''
         + ''
        + '<a id="CancelButton" href="#" data-role="button"><span class="messagebox_button" style="color:red">cancel</span></a>'
        + '</div>';
    }else
    if (messagType == MESSAGE_TYPE.Information || messagType == MESSAGE_TYPE.Error) {
        messageContent += ''
        + '<div style="float:right;margin:0em 1em 1.5em 1em">'
        + '<a id="MsgOkButton" href="#" data-role="button" ><span class="messagebox_button" >ok</span></a>'
        + '</div>';
    }

	return messageContent;
}
 