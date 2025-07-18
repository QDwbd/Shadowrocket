use crate::utils::{dirs, help};
use anyhow::Result;
// use log::LevelFilter;
use serde::{Deserialize, Serialize};

mod clash_strategy;
pub mod logging;

pub use self::clash_strategy::{ClashStrategy, ExternalControllerPortStrategy};
pub use logging::LoggingLevel;

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub enum ClashCore {
    #[serde(rename = "mihomo", alias = "clash-meta")]
    Mihomo,
    #[serde(rename = "mihomo-alpha")]
    MihomoAlpha,
}

impl Default for ClashCore {
    fn default() -> Self {
        match cfg!(feature = "default-meta") {
            false => Self::MihomoAlpha,
            true => Self::Mihomo,
        }
    }
}

impl From<ClashCore> for String {
    fn from(core: ClashCore) -> Self {
        match core {
            ClashCore::Mihomo => "mihomo".into(),
            ClashCore::MihomoAlpha => "mihomo-alpha".into(),
        }
    }
}

impl std::fmt::Display for ClashCore {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ClashCore::Mihomo => write!(f, "mihomo"),
            ClashCore::MihomoAlpha => write!(f, "mihomo-alpha"),
        }
    }
}

/// ### `verge.yaml` schema
#[derive(Default, Debug, Clone, Deserialize, Serialize)]
pub struct IVerge {
    /// app listening port for app singleton
    pub app_singleton_port: Option<u16>,

    /// app log level
    /// silent | error | warn | info | debug | trace
    pub app_log_level: Option<logging::LoggingLevel>,

    // i18n
    pub language: Option<String>,

    /// `light` or `dark` or `system`
    pub theme_mode: Option<String>,

    /// enable blur mode
    /// maybe be able to set the alpha
    pub theme_blur: Option<bool>,

    /// enable traffic graph default is true
    pub traffic_graph: Option<bool>,

    /// show memory info (only for Clash Meta)
    pub enable_memory_usage: Option<bool>,

    /// page transition animation, default is `slide`
    pub page_transition_animation: Option<String>,

    /// clash tun mode
    pub enable_tun_mode: Option<bool>,

    /// windows service mode
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enable_service_mode: Option<bool>,

    /// can the app auto startup
    pub enable_auto_launch: Option<bool>,

    /// not show the window on launch
    pub enable_silent_start: Option<bool>,

    /// set system proxy
    pub enable_system_proxy: Option<bool>,

    /// enable proxy guard
    pub enable_proxy_guard: Option<bool>,

    /// set system proxy bypass
    pub system_proxy_bypass: Option<String>,

    /// proxy guard duration
    pub proxy_guard_duration: Option<u64>,

    /// theme setting
    pub theme_setting: Option<IVergeTheme>,

    /// web ui list
    pub web_ui_list: Option<Vec<String>>,

    /// clash core path
    #[serde(skip_serializing_if = "Option::is_none")]
    pub clash_core: Option<ClashCore>,

    /// hotkey map
    /// format: {func},{key}
    pub hotkeys: Option<Vec<String>>,

    /// 切换代理时自动关闭连接
    pub auto_close_connection: Option<bool>,

    /// 默认的延迟测试连接
    pub default_latency_test: Option<String>,

    /// 支持关闭字段过滤，避免meta的新字段都被过滤掉，默认为真
    pub enable_clash_fields: Option<bool>,

    /// 是否使用内部的脚本支持，默认为真
    pub enable_builtin_enhanced: Option<bool>,

    /// proxy 页面布局 列数
    pub proxy_layout_column: Option<i32>,

    /// 日志清理
    /// 分钟数； 0 为不清理
    #[deprecated(note = "use `max_log_files` instead")]
    pub auto_log_clean: Option<i64>,
    /// 日记轮转时间，单位：天
    pub max_log_files: Option<usize>,
    /// window size and position
    #[deprecated(note = "use `window_size_state` instead")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub window_size_position: Option<Vec<f64>>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub window_size_state: Option<WindowState>,

    /// 是否启用随机端口
    pub enable_random_port: Option<bool>,

    /// verge mixed port 用于覆盖 clash 的 mixed port
    pub verge_mixed_port: Option<u16>,

    /// Check update when app launch
    pub disable_auto_check_update: Option<bool>,

    /// Clash 相关策略
    pub clash_strategy: Option<ClashStrategy>,

    /// 是否启用代理托盘选择
    pub clash_tray_selector: Option<bool>,
}

#[derive(Default, Debug, Clone, Deserialize, Serialize)]
pub struct WindowState {
    pub width: u32,
    pub height: u32,
    pub x: i32,
    pub y: i32,
    pub maximized: bool,
    pub fullscreen: bool,
}

#[derive(Default, Debug, Clone, Deserialize, Serialize)]
pub struct IVergeTheme {
    pub primary_color: Option<String>,
    pub secondary_color: Option<String>,
    pub primary_text: Option<String>,
    pub secondary_text: Option<String>,

    pub info_color: Option<String>,
    pub error_color: Option<String>,
    pub warning_color: Option<String>,
    pub success_color: Option<String>,

    pub font_family: Option<String>,
    pub css_injection: Option<String>,

    pub page_transition_duration: Option<f64>,
}

impl IVerge {
    pub fn new() -> Self {
        match dirs::verge_path().and_then(|path| help::read_yaml::<IVerge>(&path)) {
            Ok(config) => config,
            Err(err) => {
                log::error!(target: "app", "{err}");
                Self::template()
            }
        }
    }

    pub fn template() -> Self {
        Self {
            clash_core: Some(ClashCore::default()),
            language: {
                let locale = crate::utils::help::get_system_locale();
                Some(crate::utils::help::mapping_to_i18n_key(&locale).into())
            },
            app_log_level: Some(logging::LoggingLevel::default()),
            theme_mode: Some("system".into()),
            theme_blur: Some(false),
            traffic_graph: Some(true),
            enable_memory_usage: Some(true),
            enable_auto_launch: Some(false),
            enable_silent_start: Some(false),
            enable_system_proxy: Some(false),
            enable_random_port: Some(false),
            verge_mixed_port: Some(7890),
            enable_proxy_guard: Some(false),
            proxy_guard_duration: Some(30),
            auto_close_connection: Some(true),
            enable_builtin_enhanced: Some(true),
            enable_clash_fields: Some(true),
            page_transition_animation: Some("slide".into()),
            // auto_log_clean: Some(60 * 24 * 7), // 7 days 自动清理日记
            max_log_files: Some(7), // 7 days
            disable_auto_check_update: Some(true),
            clash_tray_selector: Some(true),
            ..Self::default()
        }
    }

    /// Save IVerge App Config
    pub fn save_file(&self) -> Result<()> {
        help::save_yaml(&dirs::verge_path()?, &self, Some("# Shadowrocket Config"))
    }

    /// patch verge config
    /// only save to file
    pub fn patch_config(&mut self, patch: IVerge) {
        macro_rules! patch {
            ($key: tt) => {
                if patch.$key.is_some() {
                    self.$key = patch.$key;
                }
            };
        }

        patch!(app_log_level);
        patch!(language);
        patch!(theme_mode);
        patch!(theme_blur);
        patch!(traffic_graph);
        patch!(enable_memory_usage);
        patch!(page_transition_animation);
        patch!(disable_auto_check_update);

        patch!(enable_tun_mode);
        patch!(enable_service_mode);
        patch!(enable_auto_launch);
        patch!(enable_silent_start);
        patch!(enable_system_proxy);
        patch!(enable_random_port);
        patch!(verge_mixed_port);
        patch!(enable_proxy_guard);
        patch!(system_proxy_bypass);
        patch!(proxy_guard_duration);

        patch!(theme_setting);
        patch!(web_ui_list);
        patch!(clash_core);
        patch!(hotkeys);

        patch!(auto_close_connection);
        patch!(default_latency_test);
        patch!(enable_builtin_enhanced);
        patch!(proxy_layout_column);
        patch!(enable_clash_fields);

        patch!(max_log_files);
        patch!(window_size_state);
        patch!(clash_strategy);
        patch!(clash_tray_selector);
    }
}
