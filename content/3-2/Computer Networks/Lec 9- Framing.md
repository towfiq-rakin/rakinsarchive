> The datalink layer need to pack bits into frames, so that each frame is distinguishable from another. Our postal system practices a type of framing. The simple act of inserting a letter into an envelop separates one piece of information form another; the envelope serves as the delimiter.

### Types of framing
1. **Fixed-Size Framing**
   There is no need for defining the boundaries of the frame; the size itself can be used as a delimiter.
2. **Variable-Size Framing**  
   - **Character-Oriented Protocols:** Data to be carried are 8bit characters from a coding system.
   - **Bit-Oriented Protocols:** The data section of a frame is a sequence of bits to be interpreted by the upper layer as text, graphic, audio, video and so on.

### Character-Oriented Protocols
To separate one frame from the next, an 8-bit flag, composed of protocol-dependent characters, is added at the beginning and end of a frame.

![[frame-in-character-protocol.png]]

Any pattern used for the flag could also be the part of the information. To fix this problem, a byte-stuffing strategy was added to character-oriented framings. 

>[!note]+
>Byte stuffing is the process of adding 1 extra byte (ESC-predefined but pattern) whenever the is a flag or escape character in the text.

Whenever the receiver encounters the ESC character, receiver removes it from the data section and treats the next character as data, not a delimiting flag.  
The escape characters (ESC) that are part of the text must also be marked by another escape character (ESC).

![[byte-stuffing-unstuffing.png]]

### Bit-Oriented Protocols
Most protocols use a special 8-bit pattern flag `01111110` as the delimiter to define the beginning and the end of the frame.

![[frame-in-bit-oriented-protocol.png]]

- The flag can create the same problem in the byte-oriented protocol.
- We do this by stuffing 1 sing bit (instead of 1 byte) to prevent the pattern from looking like a flag. The strategy is called Bit stuffing.
>[!note]+
>Bit stuffing is the process of adding one extra 0 whenever five consecutive 1s follow a 0 in the data, so that the receiver does not mistake the pattern `0111110` for a flag. The extra stuffed bit is removed from the data by the receiver.

![[bit-stuffing-unstuffing.png]]

### Summary
■ Data link control deals with the design and procedures for communication
between two adjacent nodes: node-to-node communication.  
■ Frames can be of fixed or variable size. In fixed-size framing, there is no need
for defining the boundaries of frames; in variable-size framing, we need a
delimiter (flag) to define the boundary of two frames.  
■ Variable-size framing uses two categories of protocols: byte-oriented (or
character-oriented) and bit-oriented. In a byte-oriented protocol, the data
section of a frame is a sequence of bytes; in a bit-oriented protocol, the data
section of a frame is a sequence of bits.  
■ In byte-oriented (or character-oriented) protocols, we use byte stuffing; a special byte added to the data section of the frame when there is a character with the same pattern as the flag.  
■ In bit-oriented protocols, we use bit stuffing; an extra 0 is added to the data
section of the frame when there is a sequence of bits with the same pattern as
the flag.  
■ Flow control refers to a set of procedures used to restrict the amount of data that the sender can send before waiting for acknowledgment. Error control refers to methods of error detection and correction.



