//! Native Rust/Kernite retest of the attention-free Rotate90 model.
mod application;
mod domain;
mod infrastructure;
mod interfaces;
#[cfg(test)]
mod tests;
fn main() -> domain::Result<()> {
    interfaces::run()
}
