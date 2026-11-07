//! Experiment definitions, independent of CUDA and serialization.
pub mod data;
pub mod model;
pub type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;
