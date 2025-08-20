# 🎭 ALL POSSIBLE DROPDOWN OPTIONS IN STUNT PERFORMER PROFILES

## **👤 GENDER OPTIONS**
```
Man
Woman  
Non-binary
Other
```

## **💼 AVAILABILITY STATUS OPTIONS**
```
available
busy
unavailable
```

## **🏢 LOAN OUT STATUS OPTIONS**
```
Unknown
Yes
No
```

## **👕 T-SHIRT SIZE OPTIONS**
```
XS
S
M
L
XL
XXL
```

## **🧤 GLOVE SIZE OPTIONS**
```
XS
S
M
L
XL
```

## **🧥 JACKET LENGTH OPTIONS** (Male-specific)
```
S
R
L
```

## **📝 FREE-FORM TEXT FIELDS** (Not dropdowns, but important for search)
### **Demographics:**
- `ethnicity` - e.g., "White, Hispanic, Asian, etc."
- `hair_color` - e.g., "Light Brown, Blonde, etc."
- `eye_color` - (no example shown in form)

### **Professional:**
- `union_status` - e.g., "SAG-AFTRA, Non-union, etc."

### **Wardrobe:**
- `hat_size` - e.g., "7 1/4"

### **Skills & Certifications:**
- `skill_id` - Free-form skill names
- `proficiency_level` - Free-form proficiency descriptions
- `certification_id` - Free-form certification names

### **Locations:**
- `location` - Primary location (free-form)
- `secondary_location` - Secondary location (free-form)
- `city` - City name
- `state` - State/region
- `country` - Country

---

## **🔍 SEARCH IMPLICATIONS**

### **For Claude AI Search Query Parsing:**

**Gender Detection:**
```javascript
// Should match these exact values:
'Man', 'Woman', 'Non-binary', 'Other'

// But also handle slang:
maleTerms = ['male', 'man', 'men', 'guy', 'guys', 'dude', 'dudes', 'boy', 'boys']
femaleTerms = ['female', 'woman', 'women', 'girl', 'girls', 'lady', 'ladies', 'chick', 'chicks']
```

**Availability Detection:**
```javascript
availabilityTerms = {
  'available': ['available', 'free', 'open', 'ready'],
  'busy': ['busy', 'working', 'booked', 'occupied'],
  'unavailable': ['unavailable', 'not available', 'out', 'off']
}
```

**Sizing Detection:**
```javascript
tshirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
gloveSizes = ['XS', 'S', 'M', 'L', 'XL']
jacketLengths = ['S', 'R', 'L'] // Short, Regular, Long
```

---

## **⚠️ CURRENT SEARCH ISSUES TO FIX**

1. **Gender Mismatch**: Database has "Man" but search might look for "male"
2. **No standardized ethnicity/hair/eye colors**: These are free-form text
3. **Skills/Certs are free-form**: No predefined list to match against
4. **Union status variations**: "SAG-AFTRA" vs "SAG" vs "AFTRA" vs "Non-union"

---

## **💡 RECOMMENDATIONS FOR SEARCH ENHANCEMENT**

### **1. Standardize Common Values**
Create dropdown lists for:
- Hair colors: `Blonde, Brunette, Black, Red, Gray, White, Auburn, etc.`
- Eye colors: `Blue, Brown, Green, Hazel, Gray, Amber, etc.`
- Ethnicities: `White, Black, Hispanic/Latino, Asian, Native American, Pacific Islander, Mixed, Other`
- Union statuses: `SAG-AFTRA, Non-union, Other`

### **2. Update Search Logic**
```javascript
// In parseSearchQuery function:
if (cleanQuery.includes('man') || cleanQuery.includes('male')) {
  filters.gender = 'Man' // Use exact database value
}
if (cleanQuery.includes('woman') || cleanQuery.includes('female')) {
  filters.gender = 'Woman' // Use exact database value  
}
```

### **3. Add Fuzzy Matching**
- "SAG" → "SAG-AFTRA" 
- "blonde" → "Blonde"
- "brunette" → "Brunette"
