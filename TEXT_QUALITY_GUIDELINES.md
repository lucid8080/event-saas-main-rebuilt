# Text Quality Guidelines for Generated Flyers

## Overview

This document outlines comprehensive guidelines for ensuring high-quality, readable text appears on generated flyers instead of gibberish or strange characters.

## Problem Statement

Generated flyers have been showing strange characters and gibberish text like:
- "HEOTKONI Y. TUWEHFDISS OR"
- "METAR TLURY CUPEH H OWEM"

Instead of proper, readable event information.

## Solution Strategy

### 1. Negative Prompts (What to Avoid)

**Always include these negative prompts in image generation:**
```
no gibberish text, no fake letters, no strange characters
```

**Additional negative prompts for specific scenarios:**
```
no nonsensical text, no random symbols, no unreadable characters
no fake language, no made-up words, no jumbled letters
```

### 2. Positive Prompts (What to Include)

**When text is needed, include these positive prompts:**
```
only real readable words if text is included
use proper English text, clear readable typography
legible text with proper spelling and grammar
```

### 3. Text Quality Control Measures

#### A. Image Generation Prompts
- **Event Type Prompts**: Include text quality control in all event type prompts
- **Style Preset Prompts**: Add text quality measures to all style presets
- **Carousel Background Prompts**: Ensure text overlay compatibility

#### B. Text Generation Prompts
- **Header Text**: Ensure real, readable English words
- **Body Text**: Maintain proper language and readability
- **CTA Text**: Use clear, action-oriented language

### 4. Implementation Standards

#### Standard Text Quality Clause
Add this to all image generation prompts:
```
no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included
```

#### Text Generation Quality Clause
Add this to all text generation prompts:
```
Use only real, readable English words - no gibberish, no fake letters, no strange characters
```

### 5. Quality Assurance Checklist

#### Before Deployment
- [ ] All event type prompts include text quality control
- [ ] All style preset prompts include text quality control
- [ ] All text generation prompts include character validation
- [ ] Default prompts in code include quality measures
- [ ] Database prompts are updated with quality standards

#### Testing Requirements
- [ ] Test with various event types
- [ ] Test with different style presets
- [ ] Verify text generation produces real words
- [ ] Check for absence of gibberish in generated images

### 6. Monitoring and Maintenance

#### Regular Checks
- Monitor generated flyers for text quality issues
- Update prompts based on new patterns of gibberish
- Maintain consistency across all prompt types

#### Continuous Improvement
- Gather feedback on text quality
- Refine prompts based on real-world usage
- Update guidelines as AI models evolve

## Implementation Status

### ✅ Completed
- Enhanced default prompts in `lib/system-prompts.ts`
- Updated style preset prompts in `scripts/seed-system-prompts.ts`
- Added text quality control to all event type prompts
- Added text quality control to all style preset prompts

### 🔄 In Progress
- Updating text generation prompts with character validation
- Creating comprehensive testing procedures

### 📋 Planned
- Database updates with enhanced prompts
- Testing and verification of improvements
- Documentation updates

## Best Practices

### 1. Prompt Structure
Always follow this structure for image generation prompts:
```
[Event/Style Description] + [Atmospheric Details] + [Text Quality Control] + [Quality Measures]
```

### 2. Text Quality Control Placement
Place text quality control measures after the main description but before quality measures:
```
[Main Content], no text unless otherwise specified, no gibberish text, no fake letters, no strange characters, only real readable words if text is included, no blur, no distortion, high quality, [professional context]
```

### 3. Consistency
Maintain consistent text quality standards across:
- Event type prompts
- Style preset prompts
- Text generation prompts
- Carousel background prompts

## Troubleshooting

### Common Issues
1. **Gibberish still appearing**: Check if all prompts include the negative prompts
2. **Inconsistent quality**: Ensure all prompt types follow the same standards
3. **Text not appearing**: Verify "no text unless otherwise specified" is included

### Solutions
1. **Add missing negative prompts** to problematic prompt types
2. **Update database prompts** to match code standards
3. **Test with different event types** to ensure consistency

## Conclusion

These guidelines ensure that all generated flyers display real, readable text instead of gibberish or strange characters. Regular monitoring and updates will maintain high text quality standards across the platform. 