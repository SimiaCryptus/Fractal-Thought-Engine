---
title: Memory-Mapped Bit-Packed Array Library for Permutation Ring Operations
layout: post
date: '"2025-11-20T00:00:00.000Z"'
last_modified: '"2024-01-15T10:00:00.000Z"'
category: projects
subcategory: Engineering & Formal Systems
tags:
  - Software Engineering
  - Algorithms
  - Technical Spec
keywords:
  - bit-packed arrays
  - mmap
  - external sorting
  - SIMD
  - cache optimization
  - permutation operations
status: stable
last_thought_date: '"2024-01-15T00:00:00.000Z"'
thought_generation: 1
parent_document: null
child_documents: []
related_documents:
  - _posts/projects/2025-11-20-bwt-fulltext-spec.md
  - _posts/projects/2025-06-30-bwt-tree-proposal.md
  - _posts/projects/2025-08-08-ceprle-rust-implementation.md
reading_order: 2
difficulty_level: advanced
reading_time_minutes: 25
document_type: technical_framework
thinking_style: analytical
consciousness_level: meta
engagement_type: analytical
reader_participation: active
cognitive_load: intense
description: >-
  High-performance C++ library for managing arbitrarily large bit-packed arrays
  using memory mapping and external sorting algorithms for permutation ring
  operations on billion-element datasets.
excerpt: >-
  A comprehensive technical framework for memory-mapped bit-packed arrays with
  swap-optimized operations, external sorting, and SIMD acceleration for
  massive-scale permutation ring systems.
meta_description: >-
  Memory-mapped bit-packed array library with external sorting and SIMD
  optimization for billion-element permutation rings
schema_type: TechArticle
schema_author: Andrew
schema_word_count: 4500
schema_reading_time: PT25M
is_featured: false
is_cornerstone: true
---
## Overview

A high-performance library for managing arbitrarily large arrays of uniform bit-width records using memory mapping and
bit-level packing. Designed to support permutation ring operations on billion-element datasets that exceed available
RAM.

## 1. Core Data Structure

### 1.1 BitPackedArray Interface

```cpp
template<typename IndexType = uint64_t>
class BitPackedArray {
private:
    size_t element_bits_;        // Bits per element (1-64)
    IndexType count_;           // Number of elements
    size_t file_size_;          // Total file size in bytes
    void* mapped_memory_;       // Memory-mapped region
    int fd_;                    // File descriptor
    
public:
    // Construction
    BitPackedArray(const std::string& filename, 
                   size_t element_bits, 
                   IndexType count, 
                   bool create_new = false);
    
    // Element access
    uint64_t get(IndexType index) const;
    void set(IndexType index, uint64_t value);
    
    // Swap operations - first class citizens
    void swap(IndexType i, IndexType j);
    void swap_ranges(IndexType start1, IndexType start2, IndexType count);
    void swap_with_array(BitPackedArray& other, IndexType i, IndexType j);
    
    // Optimized swap variants
    void conditional_swap(IndexType i, IndexType j, bool condition);
    void parallel_swap_ranges(IndexType start1, IndexType start2, IndexType count, size_t num_threads = 0);
    
    // Bulk operations
    void bulk_copy(IndexType dst_start, IndexType src_start, IndexType count);
    void bulk_set(IndexType start, IndexType count, uint64_t value);
    
    // Iterator support
    class iterator;
    iterator begin();
    iterator end();
    
    // Memory management
    void sync(bool async = false);
    void prefetch(IndexType start, IndexType count);
    void advise_sequential();
    void advise_random();
};
```

### 1.2 Bit Packing Mathematics and Swap Implementation

For element width `w` bits and index `i`:

```cpp
// Bit-level addressing
size_t bit_offset = i * w;
size_t byte_offset = bit_offset / 8;
size_t bit_in_byte = bit_offset % 8;

// Optimized swap implementation
void swap(IndexType i, IndexType j) {
    if (i == j) return;  // No-op for self-swap
    
    // Handle aligned cases efficiently
    if (element_bits_ % 8 == 0 && is_byte_aligned(i) && is_byte_aligned(j)) {
        fast_byte_aligned_swap(i, j);
        return;
    }
    
    // General bit-packed swap
    uint64_t val_i = get_bits_unsafe(i);
    uint64_t val_j = get_bits_unsafe(j);
    set_bits_unsafe(i, val_j);
    set_bits_unsafe(j, val_i);
    
    mark_pages_dirty(i, j);
}

// Optimized byte-aligned swap
void fast_byte_aligned_swap(IndexType i, IndexType j) {
    size_t bytes_per_element = element_bits_ / 8;
    uint8_t* ptr_i = mapped_bytes_ + i * bytes_per_element;
    uint8_t* ptr_j = mapped_bytes_ + j * bytes_per_element;
    
    // Use SIMD for larger elements
    if (bytes_per_element >= 16) {
        simd_swap_bytes(ptr_i, ptr_j, bytes_per_element);
    } else {
        // Unrolled swap for small elements
        switch (bytes_per_element) {
            case 1: std::swap(*ptr_i, *ptr_j); break;
            case 2: std::swap(*reinterpret_cast<uint16_t*>(ptr_i), 
                            *reinterpret_cast<uint16_t*>(ptr_j)); break;
            case 4: std::swap(*reinterpret_cast<uint32_t*>(ptr_i), 
                            *reinterpret_cast<uint32_t*>(ptr_j)); break;
            case 8: std::swap(*reinterpret_cast<uint64_t*>(ptr_i), 
                            *reinterpret_cast<uint64_t*>(ptr_j)); break;
            default: 
                for (size_t k = 0; k < bytes_per_element; k++) {
                    std::swap(ptr_i[k], ptr_j[k]);
                }
        }
    }
}

// Range swap with memory locality optimization
void swap_ranges(IndexType start1, IndexType start2, IndexType count) {
    if (count == 0 || start1 == start2) return;
    
    // Block-wise swapping for cache efficiency
    const size_t BLOCK_SIZE = 1024;  // Tuned for L1 cache
    
    for (IndexType i = 0; i < count; i += BLOCK_SIZE) {
        IndexType block_end = std::min(i + BLOCK_SIZE, count);
        
        // Prefetch both regions
        prefetch_range(start1 + i, block_end - i);
        prefetch_range(start2 + i, block_end - i);
        
        // Swap block elements
        for (IndexType j = i; j < block_end; j++) {
            swap(start1 + j, start2 + j);
        }
    }
}

// Handle cross-byte values
uint64_t get_bits(size_t byte_off, size_t bit_off, size_t width) {
    if (bit_off + width <= 8) {
        // Single byte case
        uint8_t byte_val = mapped_bytes[byte_off];
        uint8_t mask = (1 << width) - 1;
        return (byte_val >> (8 - bit_off - width)) & mask;
    } else {
        // Multi-byte case - read up to 8 bytes and extract
        uint64_t result = 0;
        size_t bytes_needed = (bit_off + width + 7) / 8;
        
        for (size_t j = 0; j < bytes_needed; j++) {
            result = (result << 8) | mapped_bytes[byte_off + j];
        }
        
        size_t total_bits = bytes_needed * 8;
        size_t shift = total_bits - bit_off - width;
        uint64_t mask = (1ULL << width) - 1;
        return (result >> shift) & mask;
    }
}
```

## 2. Specialized Collections

### 2.1 SortableArray - External Sorting with First-Class Swaps

```cpp
template<typename IndexType = uint64_t>
class SortableArray : public BitPackedArray<IndexType> {
private:
    size_t cache_size_;         // RAM cache size
    std::string temp_dir_;      // Temporary file directory
    mutable std::atomic<uint64_t> swap_count_{0};  // Performance tracking
    
public:
    // Swap-based sorting algorithms
    void quicksort_external(IndexType start, IndexType end);
    void heapsort_external();
    void introsort_external();
    
    // External merge sort with swap optimization
    void external_sort(std::function<bool(uint64_t, uint64_t)> comparator);
    
    // Swap-optimized partitioning
    IndexType partition_three_way(IndexType start, IndexType end, uint64_t pivot);
    IndexType partition_hoare(IndexType start, IndexType end, 
                             std::function<bool(uint64_t, uint64_t)> comp);
    
    // K-way merge from multiple sorted arrays
    static SortableArray merge_k_ways(
        const std::vector<SortableArray*>& arrays,
        const std::string& output_file
    );
    
    // Parallel sort using multiple threads/processes
    void parallel_sort(size_t num_threads = 0);
    
    // Swap-aware binary search
    IndexType binary_search(uint64_t target) const;
    std::pair<IndexType, IndexType> equal_range(uint64_t target) const;
    
    // Performance metrics
    uint64_t get_swap_count() const { return swap_count_.load(); }
    void reset_swap_count() { swap_count_.store(0); }
    
private:
    // Optimized swap with counting
    void tracked_swap(IndexType i, IndexType j) {
        if (i != j) {
            this->swap(i, j);
            swap_count_.fetch_add(1, std::memory_order_relaxed);
        }
    }
    
    // Cache-aware quicksort implementation
    void quicksort_cached(IndexType start, IndexType end, size_t depth_limit) {
        if (end - start < 32) {
            insertion_sort_range(start, end);
            return;
        }
        
        if (depth_limit == 0) {
            heapsort_range(start, end);
            return;
        }
        
        // Three-way partitioning to handle duplicates
        auto [lt, gt] = three_way_partition(start, end);
        
        // Recurse on smaller partition first (stack optimization)
        if (lt - start < end - gt) {
            quicksort_cached(start, lt, depth_limit - 1);
            quicksort_cached(gt, end, depth_limit - 1);
        } else {
            quicksort_cached(gt, end, depth_limit - 1);
            quicksort_cached(start, lt, depth_limit - 1);
        }
    }
    
    // Insertion sort for small ranges
    void insertion_sort_range(IndexType start, IndexType end) {
        for (IndexType i = start + 1; i < end; i++) {
            uint64_t key = this->get(i);
            IndexType j = i;
            
            while (j > start && this->get(j - 1) > key) {
                tracked_swap(j, j - 1);
                j--;
            }
        }
    }
    
    // Three-way partitioning (Dijkstra's Dutch flag)
    std::pair<IndexType, IndexType> three_way_partition(IndexType start, IndexType end) {
        uint64_t pivot = this->get(start);
        IndexType lt = start;
        IndexType i = start + 1;
        IndexType gt = end;
        
        while (i < gt) {
            uint64_t val = this->get(i);
            if (val < pivot) {
                tracked_swap(lt++, i++);
            } else if (val > pivot) {
                tracked_swap(i, --gt);
            } else {
                i++;
            }
        }
        
        return {lt, gt};
    }
};
```

### 2.2 PermutationArray - Swap-Optimized Permutation Operations

```cpp
template<typename IndexType = uint64_t>
class PermutationArray : public BitPackedArray<IndexType> {
private:
    mutable std::atomic<uint64_t> swap_operations_{0};
    
public:
    // Apply permutation: result[i] = source[perm[i]]
    void apply_permutation(const BitPackedArray<IndexType>& source,
                          BitPackedArray<IndexType>& result) const;
    
    // In-place permutation application using swaps
    void apply_permutation_inplace(BitPackedArray<IndexType>& target) const;
    
    // Compose permutations: result[i] = perm2[perm1[i]]
    void compose(const PermutationArray<IndexType>& other,
                PermutationArray<IndexType>& result) const;
    
    // Compute inverse permutation using swap-based algorithm
    void invert(PermutationArray<IndexType>& result) const;
    void invert_inplace();
    
    // Check if valid permutation
    bool is_valid_permutation() const;
    
    // Cycle decomposition and manipulation
    std::vector<std::vector<IndexType>> get_cycles() const;
    void apply_cycle_decomposition_swaps(const std::vector<std::vector<IndexType>>& cycles);
    void random_shuffle_with_swaps(size_t num_swaps = 0);
    
    // Optimized permutation sorting
    void sort_by_permutation_swaps(const std::function<bool(IndexType, IndexType)>& comp);
    
    // Transposition operations
    void apply_transposition(IndexType i, IndexType j);  // Single swap
    void apply_transpositions(const std::vector<std::pair<IndexType, IndexType>>& swaps);
    
    // Bubble sort distance computation
    IndexType bubble_sort_distance(const PermutationArray<IndexType>& other) const;
    std::vector<std::pair<IndexType, IndexType>> minimal_swap_sequence(
        const PermutationArray<IndexType>& target) const;
    
    // Performance tracking
    uint64_t get_swap_operations() const { return swap_operations_.load(); }
    void reset_swap_counter() { swap_operations_.store(0); }
    
private:
    void tracked_swap(IndexType i, IndexType j) {
        if (i != j) {
            this->swap(i, j);
            swap_operations_.fetch_add(1, std::memory_order_relaxed);
        }
    }
    
    // Cycle-following algorithm for in-place permutation
    void apply_cycles_inplace(BitPackedArray<IndexType>& target, 
                             const std::vector<std::vector<IndexType>>& cycles) const {
        std::vector<bool> visited(this->size(), false);
        
        for (const auto& cycle : cycles) {
            if (cycle.size() < 2) continue;
            
            // Apply cycle using minimal swaps
            for (size_t i = 0; i < cycle.size() - 1; i++) {
                target.swap(cycle[i], cycle[i + 1]);
            }
        }
    }
};
```

## 3. Memory Management Strategy

### 3.1 Adaptive Paging

```cpp
class AdaptivePager {
private:
    struct PageInfo {
        void* addr;
        size_t size;
        uint64_t last_access;
        uint32_t access_count;
        bool dirty;
    };
    
    std::unordered_map<size_t, PageInfo> active_pages_;
    size_t max_resident_size_;
    
public:
    // Intelligent page management
    void* get_page(size_t offset, size_t size);
    void mark_dirty(size_t offset, size_t size);
    void flush_clean_pages();
    void prefetch_sequential(size_t start, size_t length);
    
    // Access pattern analysis
    void analyze_access_pattern();
    void optimize_for_sequential();
    void optimize_for_random();
};
```

### 3.2 NUMA-Aware Allocation

```cpp
class NumaAllocator {
public:
    // Bind memory to specific NUMA nodes
    void* mmap_numa(size_t size, int node_id);
    
    // Distribute large arrays across NUMA nodes
    void distribute_array(BitPackedArray& array, 
                         const std::vector<int>& node_ids);
    
    // Migrate pages to optimal NUMA nodes
    void migrate_to_local_node(void* addr, size_t size);
};
```

## 4. External Sorting Algorithms

### 4.1 Multi-Way Merge Sort

```cpp
template<typename IndexType>
class ExternalMergeSorter {
private:
    size_t memory_limit_;
    size_t merge_factor_;
    std::string temp_directory_;
    
public:
    void sort(SortableArray<IndexType>& array) {
        // Phase 1: Create sorted runs
        std::vector<std::string> run_files = create_sorted_runs(array);
        
        // Phase 2: Multi-way merge
        while (run_files.size() > 1) {
            run_files = merge_pass(run_files);
        }
        
        // Phase 3: Copy back to original array
        copy_final_result(run_files[0], array);
    }
    
private:
    std::vector<std::string> create_sorted_runs(SortableArray<IndexType>& array) {
        std::vector<std::string> runs;
        size_t elements_per_run = memory_limit_ / array.element_size_bytes();
        
        for (IndexType start = 0; start < array.size(); start += elements_per_run) {
            IndexType end = std::min(start + elements_per_run, array.size());
            
            // Load chunk into memory
            std::vector<uint64_t> chunk;
            for (IndexType i = start; i < end; i++) {
                chunk.push_back(array.get(i));
            }
            
            // Sort in memory
            std::sort(chunk.begin(), chunk.end());
            
            // Write sorted run to disk
            std::string run_file = create_temp_file();
            write_run(run_file, chunk);
            runs.push_back(run_file);
        }
        
        return runs;
    }
    
    std::vector<std::string> merge_pass(const std::vector<std::string>& inputs) {
        std::vector<std::string> outputs;
        
        for (size_t i = 0; i < inputs.size(); i += merge_factor_) {
            size_t end = std::min(i + merge_factor_, inputs.size());
            std::vector<std::string> batch(inputs.begin() + i, inputs.begin() + end);
            
            std::string output_file = create_temp_file();
            merge_k_files(batch, output_file);
            outputs.push_back(output_file);
        }
        
        return outputs;
    }
};
```

### 4.2 Parallel External Sort

```cpp
template<typename IndexType>
class ParallelExternalSorter {
private:
    struct WorkerThread {
        std::thread thread;
        std::queue<SortTask> tasks;
        std::mutex task_mutex;
        std::condition_variable task_cv;
        bool running;
    };
    
    std::vector<WorkerThread> workers_;
    
public:
    void parallel_sort(SortableArray<IndexType>& array, size_t num_threads) {
        // Partition array across threads
        std::vector<ArrayPartition> partitions = partition_array(array, num_threads);
        
        // Sort partitions in parallel
        std::vector<std::future<std::string>> futures;
        for (const auto& partition : partitions) {
            futures.push_back(std::async(std::launch::async, 
                [this](const ArrayPartition& p) {
                    return sort_partition(p);
                }, partition));
        }
        
        // Collect sorted runs
        std::vector<std::string> sorted_runs;
        for (auto& future : futures) {
            sorted_runs.push_back(future.get());
        }
        
        // Final merge
        std::string final_file = merge_k_files(sorted_runs, "final_sort.tmp");
        copy_back_to_array(final_file, array);
    }
};
```

## 5. Performance Optimizations

### 5.1 Cache-Conscious Design

```cpp
class CacheOptimizedAccess {
private:
    static constexpr size_t CACHE_LINE_SIZE = 64;
    static constexpr size_t L1_CACHE_SIZE = 32 * 1024;
    static constexpr size_t L2_CACHE_SIZE = 256 * 1024;
    
public:
    // Prefetch multiple cache lines
    void prefetch_range(const void* addr, size_t size) {
        const char* ptr = static_cast<const char*>(addr);
        for (size_t i = 0; i < size; i += CACHE_LINE_SIZE) {
            __builtin_prefetch(ptr + i, 0, 3);  // Temporal locality
        }
    }
    
    // Block-wise operations for cache efficiency
    template<typename Op>
    void blocked_operation(BitPackedArray& array, Op operation, size_t block_size = L2_CACHE_SIZE) {
        for (size_t i = 0; i < array.size(); i += block_size) {
            size_t end = std::min(i + block_size, array.size());
            operation(i, end);
        }
    }
};
```

### 5.2 SIMD-Accelerated Swap Operations

```cpp
class SIMDSwapOperations {
public:
    // Vectorized byte swapping
    static void simd_swap_bytes(uint8_t* ptr1, uint8_t* ptr2, size_t bytes) {
        if (bytes >= 32 && is_avx2_available()) {
            simd_swap_avx2(ptr1, ptr2, bytes);
        } else if (bytes >= 16) {
            simd_swap_sse(ptr1, ptr2, bytes);
        } else {
            // Fallback to scalar swapping
            for (size_t i = 0; i < bytes; i++) {
                std::swap(ptr1[i], ptr2[i]);
            }
        }
    }
    
private:
    static void simd_swap_avx2(uint8_t* ptr1, uint8_t* ptr2, size_t bytes) {
        size_t simd_bytes = (bytes / 32) * 32;
        
        for (size_t i = 0; i < simd_bytes; i += 32) {
            __m256i vec1 = _mm256_loadu_si256((__m256i*)(ptr1 + i));
            __m256i vec2 = _mm256_loadu_si256((__m256i*)(ptr2 + i));
            
            _mm256_storeu_si256((__m256i*)(ptr1 + i), vec2);
            _mm256_storeu_si256((__m256i*)(ptr2 + i), vec1);
        }
        
        // Handle remaining bytes
        for (size_t i = simd_bytes; i < bytes; i++) {
            std::swap(ptr1[i], ptr2[i]);
        }
    }
    
    static void simd_swap_sse(uint8_t* ptr1, uint8_t* ptr2, size_t bytes) {
        size_t simd_bytes = (bytes / 16) * 16;
        
        for (size_t i = 0; i < simd_bytes; i += 16) {
            __m128i vec1 = _mm_loadu_si128((__m128i*)(ptr1 + i));
            __m128i vec2 = _mm_loadu_si128((__m128i*)(ptr2 + i));
            
            _mm_storeu_si128((__m128i*)(ptr1 + i), vec2);
            _mm_storeu_si128((__m128i*)(ptr2 + i), vec1);
        }
        
        // Handle remaining bytes
        for (size_t i = simd_bytes; i < bytes; i++) {
            std::swap(ptr1[i], ptr2[i]);
        }
    }
    
public:
    // Vectorized comparison for conditional swaps
    static void simd_conditional_swap_array(uint64_t* array, size_t size, 
                                           std::function<bool(uint64_t, uint64_t)> should_swap);
    
    // Parallel bit extraction with swap capability
    static void simd_extract_and_swap_bits(const uint8_t* packed_data, 
                                          uint64_t* output, 
                                          size_t element_bits, 
                                          size_t count,
                                          const std::vector<std::pair<size_t, size_t>>& swap_pairs);
    
    // Vectorized permutation application with swap tracking
    static void simd_apply_permutation_with_swaps(const uint64_t* source,
                                                 uint64_t* dest,
                                                 const uint64_t* perm,
                                                 size_t count,
                                                 std::atomic<uint64_t>& swap_counter);
    
    // Batch swap operations
    static void simd_batch_swap(BitPackedArray& array,
                               const std::vector<std::pair<uint64_t, uint64_t>>& swap_pairs);
};
```

## 6. Integration with Permutation Ring System

### 6.1 Usage Example with Swap-Optimized Operations

```cpp
// Create arrays for 500M suffix positions (29 bits each)
SortableArray<uint64_t> suffix_array("suffix_array.dat", 29, 500000000, true);
PermutationArray<uint64_t> forward_perm("forward.dat", 29, 500000000, true);
PermutationArray<uint64_t> backward_perm("backward.dat", 29, 500000000, true);
BitPackedArray<uint32_t> lcp_array("lcp.dat", 20, 500000000, true);  // 20 bits for LCP

// Build suffix array using swap-optimized external sort
auto compare_suffixes = [&](uint64_t a, uint64_t b) {
    return suffix_compare(text, a, b);
};

suffix_array.external_sort(compare_suffixes);
std::cout << "Suffix array sorted with " << suffix_array.get_swap_count() 
          << " swaps\n";

// Build movement permutations using swap-based algorithms
build_movement_permutations_with_swaps(suffix_array, forward_perm, backward_perm);

// Compute LCP array efficiently with swap optimization
compute_lcp_external_swapped(suffix_array, lcp_array);

// Example: Apply a series of transpositions to reorder the permutation
std::vector<std::pair<uint64_t, uint64_t>> transpositions = {
    {100000, 200000}, {50000, 150000}, {300000, 400000}
};
forward_perm.apply_transpositions(transpositions);

// Track swap efficiency
std::cout << "Permutation operations used " << forward_perm.get_swap_operations() 
          << " swaps\n";

// Swap-optimized range operations
suffix_array.swap_ranges(0, 250000000, 1000);  // Swap two 1000-element regions

// Conditional swaps based on permutation ring distance
for (size_t i = 0; i < suffix_array.size() - 1; i++) {
    uint64_t val_i = suffix_array.get(i);
    uint64_t val_j = suffix_array.get(i + 1);
    
    // Only swap if it improves some criterion
    bool should_swap = evaluate_swap_benefit(val_i, val_j);
    suffix_array.conditional_swap(i, i + 1, should_swap);
}
```

### 6.2 Memory Usage Analysis

For 500M elements:

- Suffix positions (29 bits): 1.8 GB
- Forward/backward permutations (29 bits each): 3.6 GB
- LCP values (20 bits): 1.25 GB
- **Total**: ~6.7 GB on disk, manageable RAM usage through paging

## 7. Platform-Specific Optimizations

### 7.1 Linux-Specific Features

```cpp
#ifdef __linux__
    // Use fallocate for fast file preallocation
    fallocate(fd, 0, 0, file_size);
    
    // Huge page support
    mmap(nullptr, size, PROT_READ | PROT_WRITE, 
         MAP_SHARED | MAP_HUGETLB, fd, 0);
    
    // Readahead for sequential access
    readahead(fd, offset, length);
    
    // NUMA binding
    mbind(addr, size, MPOL_BIND, &node_mask, maxnode, 0);
#endif
```

### 7.2 Cross-Platform Abstractions

```cpp
class PlatformAbstraction {
public:
    static void* create_mapping(int fd, size_t size, size_t offset);
    static void destroy_mapping(void* addr, size_t size);
    static void sync_mapping(void* addr, size_t size, bool async);
    static void prefetch_mapping(void* addr, size_t size);
    static void set_access_pattern(void* addr, size_t size, AccessPattern pattern);
};
```

This library enables your permutation ring system to scale to truly massive datasets while maintaining high performance
through careful memory management and external algorithm design.

## 8. Bzip2 Integration: Index-While-Decompressing (Advanced Topic)

### 8.1 Exploiting Bzip2's Internal BWT

Bzip2 uses the Burrows-Wheeler Transform internally, making it possible to extract permutation ring data directly during
decompression without recomputing the expensive suffix sorting.

```cpp
class Bzip2IndexBuilder {
private:
    struct Bzip2Block {
        uint32_t block_size;
        uint32_t original_ptr;      // Points to original first character
        uint8_t* bwt_data;          // The BWT-transformed block
        uint32_t* suffix_array;     // Reconstructed from BWT
        bool index_built;
    };
    
    std::vector<Bzip2Block> blocks_;
    SortableArray<uint64_t> global_suffix_array_;
    BitPackedArray<uint32_t> global_lcp_array_;
    
public:
    // Build index while decompressing bzip2 file
    std::unique_ptr<PermutationIndex> decompress_and_index(
        const std::string& bzip2_file,
        const std::string& index_prefix
    );
    
    // Extract suffix array from BWT without full decompression
    void extract_suffix_arrays_only(const std::string& bzip2_file);
    
private:
    // Hook into bzip2 decompression to capture BWT data
    static int bzip2_read_hook(void* opaque, void* buffer, int size);
    static void bzip2_block_hook(void* opaque, 
                                uint8_t* bwt_block, 
                                uint32_t block_size,
                                uint32_t original_ptr);
};

// Modified bzip2 decompression that exposes internal state
class IndexingBZ2Decoder {
private:
    bz_stream stream_;
    Bzip2IndexBuilder* index_builder_;
    
    // BWT reconstruction state
    uint32_t* tt_;              // Transformation table
    uint32_t* cftab_;           // Character frequency cumulative table
    uint8_t* ll8_;              // Working space for BWT inversion
    
public:
    IndexingBZ2Decoder(Bzip2IndexBuilder* builder) 
        : index_builder_(builder) {
        BZ2_bzDecompressInit(&stream_, 0, 0);
    }
    
    // Decompress while building suffix array from BWT
    int decompress_block_with_indexing(
        uint8_t* input, uint32_t input_size,
        uint8_t* output, uint32_t* output_size
    ) {
        // Standard bzip2 block header parsing
        uint32_t block_size, original_ptr;
        parse_bzip2_block_header(input, &block_size, &original_ptr);
        
        // Extract BWT data directly
        uint8_t* bwt_data = input + BZIP2_BLOCK_HEADER_SIZE;
        
        // Build suffix array from BWT using existing transformation table
        uint32_t* suffix_array = reconstruct_suffix_array_from_bwt(
            bwt_data, block_size, original_ptr
        );
        
        // Add to global index
        index_builder_->add_block_suffix_array(suffix_array, block_size, 
                                              get_global_offset());
        
        // Continue with normal decompression
        return BZ2_bzDecompress(&stream_);
    }
    
private:
    // Reconstruct suffix array from BWT without full string reconstruction
    uint32_t* reconstruct_suffix_array_from_bwt(
        uint8_t* bwt_data, uint32_t block_size, uint32_t original_ptr
    ) {
        // Use bzip2's internal transformation table reconstruction
        build_transformation_table(bwt_data, block_size);
        
        // Extract suffix array positions directly from tt_ table
        uint32_t* suffix_array = new uint32_t[block_size];
        uint32_t pos = original_ptr;
        
        for (uint32_t i = 0; i < block_size; i++) {
            suffix_array[i] = pos;
            pos = tt_[pos];
        }
        
        return suffix_array;
    }
    
    // Build the transformation table (standard bzip2 algorithm)
    void build_transformation_table(uint8_t* bwt_data, uint32_t block_size) {
        // Character frequency counting
        memset(cftab_, 0, 257 * sizeof(uint32_t));
        for (uint32_t i = 0; i < block_size; i++) {
            cftab_[bwt_data[i]]++;
        }
        
        // Convert to cumulative frequencies
        for (int32_t i = 1; i < 257; i++) {
            cftab_[i] += cftab_[i-1];
        }
        
        // Build transformation table
        for (int32_t i = block_size - 1; i >= 0; i--) {
            uint8_t ch = bwt_data[i];
            tt_[--cftab_[ch]] = i;
        }
    }
};
```

### 8.2 Block-Level Index Merging

```cpp
class BlockIndexMerger {
private:
    struct BlockIndex {
        uint32_t* suffix_array;
        uint32_t block_size;
        uint64_t global_offset;     // Position in full file
        uint32_t* lcp_array;        // Computed for this block
        bool is_sorted;
    };
    
    std::vector<BlockIndex> block_indices_;
    
public:
    // Merge block-level suffix arrays into global index
    void merge_block_indices(const std::string& output_prefix) {
        // Sort blocks by global offset
        std::sort(block_indices_.begin(), block_indices_.end(),
                 [](const BlockIndex& a, const BlockIndex& b) {
                     return a.global_offset < b.global_offset;
                 });
        
        // Compute global suffix array size
        uint64_t total_size = 0;
        for (const auto& block : block_indices_) {
            total_size += block.block_size;
        }
        
        // Create global arrays
        SortableArray<uint64_t> global_sa(output_prefix + "_sa.dat", 
                                         compute_bits_needed(total_size),
                                         total_size, true);
        
        // Merge using k-way merge algorithm
        merge_k_sorted_blocks(global_sa);
        
        // Build movement permutations from merged suffix array
        build_movement_permutations_from_merged(global_sa);
    }
    
private:
    // K-way merge of sorted block suffix arrays
    void merge_k_sorted_blocks(SortableArray<uint64_t>& global_sa) {
        // Priority queue for k-way merge
        using MergeNode = std::tuple<uint64_t, size_t, size_t>; // value, block_idx, pos_in_block
        std::priority_queue<MergeNode, std::vector<MergeNode>, std::greater<>> pq;
        
        // Initialize with first element from each block
        for (size_t i = 0; i < block_indices_.size(); i++) {
            if (block_indices_[i].block_size > 0) {
                uint64_t global_pos = block_indices_[i].global_offset + 
                                     block_indices_[i].suffix_array[0];
                pq.emplace(global_pos, i, 0);
            }
        }
        
        // Merge into global suffix array
        uint64_t output_pos = 0;
        while (!pq.empty()) {
            auto [value, block_idx, pos_in_block] = pq.top();
            pq.pop();
            
            global_sa.set(output_pos++, value);
            
            // Add next element from the same block
            if (pos_in_block + 1 < block_indices_[block_idx].block_size) {
                uint64_t next_pos = block_indices_[block_idx].global_offset +
                                   block_indices_[block_idx].suffix_array[pos_in_block + 1];
                pq.emplace(next_pos, block_idx, pos_in_block + 1);
            }
        }
    }
};
```

### 8.3 Streaming Index Construction

```cpp
class StreamingBzip2Indexer {
private:
    std::unique_ptr<IndexingBZ2Decoder> decoder_;
    std::unique_ptr<BlockIndexMerger> merger_;
    std::string temp_dir_;
    size_t processed_blocks_;
    
public:
    // Stream processing of large bzip2 files
    void index_large_bzip2_stream(std::istream& input, 
                                 const std::string& index_prefix) {
        const size_t BUFFER_SIZE = 1024 * 1024;  // 1MB buffer
        std::vector<uint8_t> input_buffer(BUFFER_SIZE);
        std::vector<uint8_t> output_buffer(BUFFER_SIZE * 4);  // Decompression ratio
        
        while (!input.eof()) {
            input.read(reinterpret_cast<char*>(input_buffer.data()), BUFFER_SIZE);
            uint32_t bytes_read = input.gcount();
            
            if (bytes_read == 0) break;
            
            uint32_t output_size = output_buffer.size();
            int result = decoder_->decompress_block_with_indexing(
                input_buffer.data(), bytes_read,
                output_buffer.data(), &output_size
            );
            
            // Process any completed blocks
            if (result == BZ_STREAM_END || processed_blocks_ % 100 == 0) {
                // Periodic merging to avoid memory exhaustion
                merger_->partial_merge_and_flush();
            }
            
            processed_blocks_++;
        }
        
        // Final merge
        merger_->merge_block_indices(index_prefix);
    }
    
    // Memory-efficient processing for very large files
    void index_with_external_merge(const std::string& bzip2_file,
                                  const std::string& index_prefix,
                                  size_t memory_limit = 2ULL * 1024 * 1024 * 1024) {  // 2GB default
        
        size_t blocks_per_batch = memory_limit / (sizeof(uint32_t) * AVERAGE_BLOCK_SIZE);
        
        std::vector<std::string> temp_index_files;
        size_t batch_count = 0;
        
        // Process in batches
        while (has_more_blocks()) {
            std::string batch_file = temp_dir_ + "/batch_" + std::to_string(batch_count++) + ".idx";
            process_batch(blocks_per_batch, batch_file);
            temp_index_files.push_back(batch_file);
        }
        
        // External merge of batch indices
        external_merge_index_files(temp_index_files, index_prefix);
    }
};
```

### 8.4 Performance Optimizations

```cpp
class Bzip2IndexOptimizer {
public:
    // Parallel block processing
    static void parallel_block_indexing(
        const std::vector<std::string>& bzip2_files,
        const std::string& merged_index_prefix,
        size_t num_threads = 0
    ) {
        if (num_threads == 0) {
            num_threads = std::thread::hardware_concurrency();
        }
        
        std::vector<std::future<std::string>> futures;
        
        // Process each file in parallel
        for (const auto& file : bzip2_files) {
            futures.push_back(std::async(std::launch::async,
                [](const std::string& bzip2_file) {
                    StreamingBzip2Indexer indexer;
                    std::string temp_index = create_temp_index_name();
                    
                    std::ifstream input(bzip2_file, std::ios::binary);
                    indexer.index_large_bzip2_stream(input, temp_index);
                    
                    return temp_index;
                }, file));
        }
        
        // Collect results and merge
        std::vector<std::string> temp_indices;
        for (auto& future : futures) {
            temp_indices.push_back(future.get());
        }
        
        // Final k-way merge of all indices
        SortableArray<uint64_t>::merge_k_ways_from_files(
            temp_indices, merged_index_prefix
        );
    }
    
    // Cache-aware BWT inversion
    static void optimized_bwt_to_suffix_array(
        const uint8_t* bwt_data, uint32_t block_size,
        uint32_t original_ptr, uint32_t* suffix_array
    ) {
        // Use cache-blocking for large blocks
        const size_t BLOCK_SIZE = 4096;  // Cache-friendly block size
        
        if (block_size > BLOCK_SIZE * 4) {
            blocked_bwt_inversion(bwt_data, block_size, original_ptr, suffix_array);
        } else {
            standard_bwt_inversion(bwt_data, block_size, original_ptr, suffix_array);
        }
    }
    
private:
    static void blocked_bwt_inversion(
        const uint8_t* bwt_data, uint32_t block_size,
        uint32_t original_ptr, uint32_t* suffix_array
    ) {
        // Process BWT inversion in cache-friendly blocks
        // This reduces memory bandwidth and improves performance
        // for large blocks common in bzip2 files
        
        std::vector<uint32_t> block_cftab(257, 0);
        std::vector<uint32_t> block_tt(block_size);
        
        // Build frequency table in blocks
        for (uint32_t start = 0; start < block_size; start += BLOCK_SIZE) {
            uint32_t end = std::min(start + BLOCK_SIZE, block_size);
            
            for (uint32_t i = start; i < end; i++) {
                block_cftab[bwt_data[i]]++;
            }
        }
        
        // Convert to cumulative and build transformation table
        for (int32_t i = 1; i < 257; i++) {
            block_cftab[i] += block_cftab[i-1];
        }
        
        for (int32_t i = block_size - 1; i >= 0; i--) {
            uint8_t ch = bwt_data[i];
            block_tt[--block_cftab[ch]] = i;
        }
        
        // Extract suffix array
        uint32_t pos = original_ptr;
        for (uint32_t i = 0; i < block_size; i++) {
            suffix_array[i] = pos;
            pos = block_tt[pos];
        }
    }
};
```

This approach is incredibly efficient because:

**Zero Redundant Computation**: We're reusing the BWT that bzip2 already computed, avoiding the expensive $O(n \log n)$
suffix sorting step.

**Streaming Processing**: Can handle arbitrarily large compressed files without loading everything into memory.

**Block-Level Parallelism**: Each bzip2 block can be processed independently, enabling parallel indexing.

**Memory Efficiency**: Only need to store suffix arrays for current batch of blocks, not the entire decompressed file.

**Cache Optimization**: The block structure of bzip2 naturally provides cache-friendly access patterns.

For a 1GB bzip2 file, this could build the full permutation ring index in a fraction of the time needed for plaintext
indexing, while using minimal additional memory beyond what's needed for decompression!# Memory-Mapped Bit-Packed Array
Library
