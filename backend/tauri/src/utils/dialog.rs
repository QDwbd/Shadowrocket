use rfd::{MessageButtons, MessageDialog, MessageLevel};
use rust_i18n::t;

pub fn panic_dialog(msg: &str) {
    let msg = format!("{}\n\n{}", msg, t!("dialog.panic"));
    MessageDialog::new()
        .set_level(MessageLevel::Error)
        .set_title("Shadowrocket Crash")
        .set_description(msg.as_str())
        .set_buttons(MessageButtons::Ok)
        .show();
}

pub fn migrate_dialog(msg: &str) -> bool {
    MessageDialog::new()
        .set_level(MessageLevel::Warning)
        .set_title("Shadowrocket Migration")
        .set_buttons(MessageButtons::YesNo)
        .set_description(msg)
        .show()
}

pub fn error_dialog(msg: String) {
    MessageDialog::new()
        .set_level(MessageLevel::Error)
        .set_title("Shadowrocket Error")
        .set_description(msg.as_str())
        .set_buttons(MessageButtons::Ok)
        .show();
}
